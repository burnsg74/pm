<?php

namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Command;
use Asana\Client;
use Parsedown;

//use Symfony\Component\Panther\Client;
//use Symfony\Component\Panther\DomCrawler\Crawler;

class SyncCfm extends Command
{
    protected $signature = 'cfm:sync';
    protected $description = 'Sync with CFM ticketing system';

    public function handle()
    {
        $parsedown = new Parsedown();
        $client = Client::accessToken('1/1196193450160458:2db9f13039d4439be7ef8ffc69dab4dc');
        $result = $client->tasks->getTasksForProject('1196163504001410');
        foreach ($result as $item) {
            $task = $client->tasks->getTask($item->gid);

            $ticketFilename = $task->gid . '.md';
            $fullPath       = '/Users/greg/notes/clients/cfm/tasks/' . $ticketFilename;

            $meta           = "<meta name='name' content='{$task->name}'>" . PHP_EOL;
            $meta           .= "<meta name='code' content='{$task->gid}'>" . PHP_EOL;
            $meta           .= "<meta name='status' content='{$task->memberships[0]->section->name}'>" . PHP_EOL;

            $content = $meta . PHP_EOL . "
modified_at: {$task->modified_at}

[Ticket URL]({$task->permalink_url})

Status: {$task->assignee_status} / {$task->memberships[0]->section->name}
Completed: {$task->completed}
Completed At: {$task->completed_at}


{$task->notes}";


            if (!file_exists('/Users/greg/notes/clients/cfm/tasks/')) {
                mkdir('/Users/greg/notes/clients/cfm/tasks/', 0777, true);
            }

            file_put_contents($fullPath, $content);

            $taskRec                = new Task();
            $taskRec->project_id    = 4;
            $taskRec->code          = $task->gid;
            $taskRec->name          = $task->name;
            $taskRec->status        = $task->memberships[0]->section->name;
            $taskRec->folder        = $fullPath;
            $taskRec->note_markdown = $task->notes;
            $taskRec->note_html     = $parsedown->text($taskRec->note_markdown);
            $taskRec->save();

        }
    }
}
