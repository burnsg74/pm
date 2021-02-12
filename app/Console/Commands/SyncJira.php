<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Console\Command;
use JiraRestApi\Issue\IssueService;
use JiraRestApi\JiraException;
use Parsedown;

class SyncJira extends Command
{
    protected $signature = 'sync:jira';

    protected $description = 'Command description';

    public function handle()
    {
        try {

            $parsedown = new Parsedown();
            $issueService = new IssueService();

            // updated >= -60m AND assignee in (currentUser()) AND project = DMPV3KB ORDER BY Rank ASC
            $q = 'assignee in (currentUser()) AND project = DMPV3KB ORDER BY Rank ASC';
            $startAt = 0;
            $ret = $issueService->search($q,$startAt,15);
            while(count($ret->issues) > 0){
                if ($startAt === 0) {
                    $totalCount = $ret->total;
                    $this->line("Total : {$totalCount}");

                    $bar = $this->output->createProgressBar($totalCount);
                    $bar->start();
                }
                $startAt +=15;

            $project   = Project::where('code','DMPV3KB')->first();
            // do something with fetched data
            foreach ($ret->issues as $issue) {
                $bar->advance();
                //dump($issue);

//                $this->line('KEY: ' . $issue->key);
//                $this->line('Created: ' . $issue->fields->created->format('Y-m-d H:i:s'));
//                $this->line('Updated: ' . $issue->fields->updated->format('Y-m-d H:i:s'));
//                $this->line('Summary: ' . $issue->fields->summary);
//                $this->line('Description: ' . $issue->fields->description);
//                $this->line('');
//                $this->line('Creator: ' . $issue->fields->creator->displayName);
//                $this->line('Status: ' .$issue->fields->status->name);
//                $this->line('Priority: ' .$issue->fields->priority->name);

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

                $taskRec->project_id    = $project->id;
                $taskRec->code          = strtoupper($issue->key);
                $taskRec->name          = $issue->fields->summary;
                $taskRec->status        = $issue->fields->status->name;
                $taskRec->folder        = $fullPath;
                $taskRec->note_markdown = $issue->fields->description;
                $taskRec->note_html     = $parsedown->text($taskRec->note_markdown);
                $taskRec->save();
            }
                $ret = $issueService->search($q,$startAt,15);
            }
            $bar->finish();
            $this->line("Total : {$totalCount}");
        } catch (JiraException $e) {
            print("Error Occurred! " . $e->getMessage());
        }
    }
}
