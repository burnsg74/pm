<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Console\Command;
use JiraRestApi\Issue\IssueService;
use JiraRestApi\JiraException;
use Parsedown;

class SynJira extends Command
{
    protected $signature = 'sync:jira';

    protected $description = 'Command description';

    public function handle()
    {
        //
        try {
            $issueService = new IssueService();
            // updated >= -60m AND assignee in (currentUser()) AND project = DMPV3KB ORDER BY Rank ASC
            $q = 'assignee in (currentUser()) AND project = DMPV3KB ORDER BY Rank ASC';

            $queryParam = [
                'fields' => [  // default: '*all'
                               'summary',
                               'comment',
                ],
                'expand' => [
                    'renderedFields',
                    'names',
                    'schema',
                    'transitions',
                    'operations',
                    'editmeta',
                    'changelog',
                ]
            ];

            $ret = $issueService->search($q);

            $totalCount = $ret->total;
            $this->line("Total : {$totalCount}");

            $project   = Project::find(5);
            $parsedown = new Parsedown();
            // do something with fetched data
            foreach ($ret->issues as $issue) {
                //dump($issue);

                $this->line('KEY: ' . $issue->key);
                $this->line('Created: ' . $issue->fields->created->format('Y-m-d H:i:s'));
                $this->line('Updated: ' . $issue->fields->updated->format('Y-m-d H:i:s'));
                $this->line('Summary: ' . $issue->fields->summary);
                $this->line('Description: ' . $issue->fields->description);
                $this->line('');
                $this->line('Creator: ' . $issue->fields->creator->displayName);
                $this->line('Status: ' .$issue->fields->status->name);
                $this->line('Priority: ' .$issue->fields->priority->name);

                $taskRec                = Task::where('code',$issue->key)->first();
                if (! $taskRec) {
                    $taskRec = new Task();
                }

                $ticketFilename = date('Y-m-d-H-i-s-') . str_replace(' ', '-', preg_replace("/[^A-Za-z0-9 ]/", '', $issue->fields->summary)) . '.md';
                $meta           = "<meta name='name' content='{$issue->fields->summary}'>" . PHP_EOL;
                $meta           .= "<meta name='code' content='{$issue->key}'>" . PHP_EOL;
                $meta           .= "<meta name='status' content='{$issue->fields->status->name}'>" . PHP_EOL;
                $fullPath       = $project->folder . '/tasks/' . $ticketFilename;
                $content        = $meta . PHP_EOL . $issue->fields->description;

                if (!file_exists($project->folder . '/tasks')) {
                    mkdir($project->folder . '/tasks', 0777, true);
                }

                file_put_contents($fullPath, $content);

                $taskRec->project_id    = 5;
                $taskRec->code          = strtoupper($issue->key);
                $taskRec->name          = $issue->fields->summary;
                $taskRec->status        = $issue->fields->status->name;
                $taskRec->folder        = $fullPath;
                $taskRec->note_markdown = $issue->fields->description;
                $taskRec->note_html     = $parsedown->text($taskRec->note_markdown);
                $taskRec->save();
            }
        } catch (JiraException $e) {
            print("Error Occured! " . $e->getMessage());
        }
    }
}
