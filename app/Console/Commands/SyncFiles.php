<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Note;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Parsedown;

class SyncFiles extends Command
{

    protected $signature = 'notes:sync';
    protected $description = 'Sync Notes Files';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $now = Carbon::now();

        $this->line('Scan Started');
        $existingNotes = Note::all()->keyBy('full_path_hash');
        $scannedNotes  = [];

        $baseFolder = '/Users/greg/notes';
        $client     = null;
        $project    = null;
        $task       = null;
        $tags       = [];
        $results    = $this->find_all_files($baseFolder);

        foreach ($results as $result) {
            $this->line($result);

            $parsedown = new Parsedown();
            $pathInfo            = pathinfo($result);
            $fileFolder          = substr($pathInfo['dirname'], strlen($baseFolder) + 1);
            $filePath            = substr($result, strlen($baseFolder) + 1);
            $stat                = stat($result);
            $hash                = md5($result);
            $scannedNotes[$hash] = ['scanned' => true];

            if (!empty($pathInfo['extension']) && $pathInfo['extension'] == 'md') {
                $content       = file_get_contents($result);
                $tags = get_meta_tags($result);
            }

            if (!empty($existingNotes[$hash])) {
                $lastAccessedAt     = Carbon::createFromTimestamp($stat['atime']);
                $existingAccessedAt = Carbon::parse($existingNotes[$hash]->file_accessed_at);
                $hasUpdated         = $lastAccessedAt->greaterThan($existingAccessedAt);

                $note = $existingNotes[$hash];
            } else {
                $note = new Note();
            }

            $note->name             = $pathInfo['filename'];
            $note->note = $parsedown->text($content);
            $note->filename         = $pathInfo['basename'];
            $note->folder           = $pathInfo['dirname'];
            $note->ext              = $pathInfo['extension'] ?? '';
            $note->file_size        = $stat['size'];
            $note->full_path        = $result;
            $note->full_path_hash   = $hash;
            $note->file_accessed_at = Carbon::createFromTimestamp($stat['atime'])->toDateTimeString();
            $note->file_modified_at = Carbon::createFromTimestamp($stat['mtime'])->toDateTimeString();
            $note->file_created_at  = Carbon::createFromTimestamp($stat['ctime'])->toDateTimeString();
            $note->save();

            $folders = explode('/', $filePath);
            foreach ($folders as $index => $folder) {
                if ($folder === 'clients' && !empty($folders[$index + 1])) {
                    $clientCode = strtoupper($folders[$index + 1]);
                    if ($client === null || $client->code !== $clientCode) {
                        $client = Client::firstOrCreate(['code' => $clientCode]);
                    }

                    if (!empty($folders[$index + 2]) && $folders[$index + 2] === 'index.md') {

                        $client->notes = $parsedown->text($content);

                        if ((!empty($tags['name'])) && $client->name !== $tags['name']) {
                            $client->name = $tags['name'];
                            $client->save();
                        }

                        if ((!empty($tags['started_at'])) && $client->started_at !== $tags['started_at']) {
                            $client->started_at = $tags['started_at'];
                            $client->save();
                        }

                        if ((!empty($tags['order'])) && $client->order !== $tags['order']) {
                            $client->order = $tags['order'];
                            $client->save();
                        }

                        if ((!empty($tags['status'])) && $client->status !== $tags['status']) {
                            $client->status = $tags['status'];
                            $client->save();
                        }

                    }

                }
                if ($folder === 'projects' && !empty($folders[$index + 1])) {
                    $projectCode = strtoupper($folders[$index + 1]);
                    if ($project === null || $project->code !== $projectCode) {
                        $project = Project::firstOrCreate(['code' => $projectCode]);
                    }

                    if ($project->client_id !== $client->id) {
                        $project->client_id = $client->id;
                        $project->save();
                    }

                    if ($folders[$index + 2] === 'index.md') {
                        $project->notes = $parsedown->text($content);

                        if ($project->note_id !== $note->id) {
                            $project->note_id = $note->id;
                            $project->save();
                        }
                        if ((!empty($tags['name'])) && $project->name !== $tags['name']) {
                            $project->name = $tags['name'];
                            $project->save();
                        }
                    }
                }

                // TASKS
                if ($folder === 'tasks' && !empty($folders[$index + 1])) {
                    $taskCode = strtoupper($folders[$index + 2]);

                    // TASK Notes Markdown File
                    if (!empty($folders[$index + 3]) && $folders[$index + 3] === 'index.md') {

                        if ($task === null || $task->code !== $taskCode) {
                            $task = Task::firstOrCreate(['code' => $taskCode]);
                        }

                        $task->notes = $parsedown->text($content);


                        if ($task->client_id !== $client->id) {
                            $task->client_id = $client->id;
                            $task->save();
                        }

                        if ($task->project_id !== $project->id) {
                            $task->project_id = $project->id;
                            $task->save();
                        }

                        if ($task->note_id !== $note->id) {
                            $task->note_id = $note->id;
                            $task->save();
                        }

                        if ($task->status !== $folders[$index + 1]) {
                            $task->status = $folders[$index + 1];
                            $task->save();
                        }

                        if ((!empty($tags['name'])) && $project->name !== $tags['name']) {
                            $task->name = $tags['name'];
                            $task->save();
                        }
                        if ((!empty($tags['started_at'])) && $task->started_at !== $tags['started_at']) {
                            $task->started_at = $tags['started_at'];
                            $task->save();
                        }
                        if ((!empty($tags['completed_at'])) && $task->completed_at !== $tags['completed_at']) {
                            $task->completed_at = $tags['completed_at'];
                            $task->save();
                        }
                        if ((!empty($tags['duration'])) && $task->duration !== $tags['duration']) {
                            $task->duration = $tags['duration'];
                            $task->save();
                        }
                        if ((!empty($tags['order'])) && $task->order !== $tags['order']) {
                            $task->order = $tags['order'];
                            $task->save();
                        }

                        // Open file
                        // Read each line, Look for # Workload and # History
                        // https://vuetifyjs.com/en/components/calendars/

                    }
                }
            }

        }

        foreach ($existingNotes as $hash => $existingNote) {
            if (empty($scannedNotes[$hash])) {
                $existingNote->delete();
            }
        }
    }

    public function find_all_files($dir)
    {
        $root   = scandir($dir);
        $result = [];
        foreach ($root as $value) {
            if ($value === '.' || $value === '..') {
                continue;
            }
            if (substr($value, 0, 1) === '.') {
                continue;
            }
            if (is_file("$dir/$value")) {
                $result[] = "$dir/$value";
                continue;
            }
            foreach ($this->find_all_files("$dir/$value") as $value2) {
                $result[] = $value2;
            }
        }
        return $result;
    }

}
