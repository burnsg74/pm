<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\Task;
use App\Models\WorkLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Parsedown;

class ClientsSync extends Command
{
    protected $signature = 'clients:sync';
    protected $description = 'Sync Clients';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $this->line('Scan Started');



        $baseFolder = env('NOTES_FOLDER', '/Users/greg/notes') . '/clients';
        $project    = null;
        $task       = null;
        $parsedown  = new Parsedown();

        DB::statement("SET foreign_key_checks=0");
        WorkLog::truncate();
        DB::statement("SET foreign_key_checks=1");

        foreach (scandir($baseFolder) as $file) {
            if ($file === '.' || $file === '..' || substr($file, 0, 1) === '.' || is_file("$baseFolder/$file")) {
                continue;
            }

            $projectCode     = strtoupper($file);
            $project         = Project::firstOrCreate(['code' => $projectCode]);
            $project->folder = $baseFolder . '/' . $file;

            $clientNotesMarkdown = '';
            if (is_file($project->folder . '/client-notes.md')) {
                $clientNotesMarkdown = file_get_contents($project->folder . '/client-notes.md');
            }
            $project->client_notes_markdown = $this->removeMetas($clientNotesMarkdown);
            $project->client_notes_html     = $parsedown->text($project->client_notes_markdown);

            $projectNotesMarkdown = '';
            $tags                 = [];
            if (is_file($project->folder . '/project-notes.md')) {
                $projectNotesMarkdown = file_get_contents($project->folder . '/project-notes.md');
                $tags                 = get_meta_tags($project->folder . '/project-notes.md');
            }
            $project->project_notes_markdown = $this->removeMetas($projectNotesMarkdown);
            $project->project_notes_html     = $parsedown->text($project->project_notes_markdown);

            if ((!empty($tags['name'])) && $project->name !== $tags['name']) {
                $project->name = $tags['name'];
            }

            if ((!empty($tags['order'])) && $project->order !== $tags['order']) {
                $project->order = $tags['order'];
            }

            if ((!empty($tags['started_at'])) && $project->started_at !== $tags['started_at']) {
                $project->started_at = $tags['started_at'];
            }

            if ((!empty($tags['statuses'])) && $project->statuses !== $tags['statuses']) {
                $project->statuses = $tags['statuses'];
            }

            $project->save();

            $tasksFoler = $project->folder . '/tasks';
            if (!file_exists($tasksFoler)) {
                mkdir($tasksFoler, 0777, true);
            }
            foreach (scandir($tasksFoler) as $file) {
                if ($file === '.' || $file === '..' || substr($file, 0, 1) === '.') {
                    continue;
                }
                $ticketFullPath = $tasksFoler . '/' . $file;
                $ticketMarkdown = file_get_contents($ticketFullPath);
                $tags           = get_meta_tags($ticketFullPath);


                $rawContent   = $this->removeMetas($ticketMarkdown);
                $notes        = '';
                $scratchpad   = '';
                $inWorklog    = false;
                $inScratchpad = false;
                $worklogs     = [];
                foreach (preg_split("/([\r\n]|[\n])/", $rawContent) as $line) {
                    if (substr($line, 0, 1) === '#') {
                        $inWorklog    = false;
                        $inScratchpad = false;
                        $header       = strtoupper($line);

                        if (substr($header, 0, 10) === '## WORKLOG') {
                            $inWorklog = true;
                            continue;
                        }

                        if (substr($header, 0, 13) === '## SCRATCHPAD') {
                            $inScratchpad = true;
                            continue;
                        }
                    }

                    if ($inWorklog) {
                        if (!$this->isJson($line)) {
                            continue;
                        }
                        $worklogs[] = json_decode($line, true);
                        continue;
                    }

                    if ($inScratchpad) {
                        $scratchpad .= $line;
                        continue;
                    }

                    $notes .= $line . PHP_EOL;
                }

                $task                      = Task::firstOrCreate(['folder' => $ticketFullPath]);
                $task->project_id          = $project->id;
                $task->code                = $tags['code'] ?? 'NOT SET';
                $task->name                = $tags['name'] ?? 'NOT SET';
                $task->status              = $tags['status'] ?? 'Backlog';
                $task->note_markdown       = $notes;
                $task->note_html           = $parsedown->text($task->note_markdown);
                $task->scratchpad_markdown = $scratchpad;
                $task->scratchpad_html     = $parsedown->text($task->scratchpad_markdown);
                $task->save();

                foreach ($worklogs as $worklog) {
                    $workLog           = new WorkLog();
                    $workLog->task_id  = $task->id;
                    $workLog->name     = "Worked on task {$task->code}";
                    $workLog->start_at = $worklog['start'];
                    $workLog->end_at   = $worklog['end'];
                    $workLog->duration = $worklog['duration'];
                    $workLog->save();
                }
            }
        }
    }

    private function removeMetas($content)
    {
        $newContent = '';
        foreach (preg_split("/([\r\n]|[\n])/", $content) as $line) {
            if (substr($line, 0, 6) === '<meta ') {
                continue;
            }
            $newContent .= $line . PHP_EOL;
        }
        return $newContent;
    }

    private function isJson($string)
    {
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}
