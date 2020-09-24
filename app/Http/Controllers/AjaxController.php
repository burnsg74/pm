<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Note;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Parsedown;

class AjaxController extends Controller
{
    public function __invoke(Request $request, $item)
    {
        try {
            $function = strtolower($request->method()) . ucwords($item);
            $payload  = $this->$function($request);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }

        return [
            'success' => true,
            'payload' => $payload
        ];
    }

    private function postClient(Request $request)
    {
        $client       = new Client();
        $client->code = $request->input('code');
        $client->name = $request->input('name');
        $client->save();

        return $this->getClients($request);
    }

    private function getClients(Request $request)
    {
        $clients = Client::all();
        foreach ($clients as $client) {
            $contents         = file_get_contents($client->note->full_path);
            $parsedown        = new Parsedown();
            $client->path     = $client->note->full_path;
            $client->markdown = $contents;
            $client->html     = $parsedown->text($contents);
        }
        return $clients;
    }

    private function postProject(Request $request)
    {
        $project       = new Project();
        $project->code = $request->input('code');
        $project->name = $request->input('name');
        $project->save();

        return $this->getProjects($request);
    }

    private function getProjects(Request $request)
    {
        $projects = Project::all();
        foreach ($projects as $project) {
            $contents          = file_get_contents($project->note->full_path);
            $parsedown         = new Parsedown();
            $project->path     = $project->note->full_path;
            $project->markdown = $contents;
            $project->html     = $parsedown->text($contents);
        }
        return $projects;
    }

    private function postTask(Request $request)
    {
        // /Users/greg/notes/clients/sn/projects/sn/tasks/Backlog/sn-13/

        $client      = Client::find($request->input('client_id'));
        $clientCode  = strtolower($client->code);
        $project     = Project::find($request->input('project_id'));
        $projectCode = strtolower($project->code);
        $ticket      = strtolower($request->input('ticket'));
        $name        = $request->input('name');
        $status      = $request->input('status');
        $nameMeta    = "<meta name='name' content='{$name}'>";
        $fullPath    = "/Users/greg/notes/clients/{$clientCode}/projects/{$projectCode}/tasks/{$status}/{$ticket}";
        $content     = $nameMeta . PHP_EOL . $request->input('markdown');

        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);
        }

        $fullPath    = $fullPath . "/index.md";
        file_put_contents($fullPath,$content);

        $pathInfo = pathinfo($fullPath);
        $stat     = stat($fullPath);
        $hash     = md5($fullPath);

        $note                   = new Note();
        $note->name             = $pathInfo['filename'];
        $note->filename         = $pathInfo['basename'];
        $note->folder           = $pathInfo['dirname'];
        $note->ext              = $pathInfo['extension'] ?? '';
        $note->file_size        = $stat['size'];
        $note->full_path        = $fullPath;
        $note->full_path_hash   = $hash;
        $note->file_accessed_at = Carbon::createFromTimestamp($stat['atime'])->toDateTimeString();
        $note->file_modified_at = Carbon::createFromTimestamp($stat['mtime'])->toDateTimeString();
        $note->file_created_at  = Carbon::createFromTimestamp($stat['ctime'])->toDateTimeString();
        $note->save();

        $task             = new Task();
        $task->client_id  = $client->id;
        $task->project_id = $project->id;
        $task->note_id    = $note->id;
        $task->code       = $ticket;
        $task->name       = $name;
        $task->status     = $status;
        $task->save();

        return true;
    }

    private function getTasks(Request $request)
    {
        $tasks = Task::all();
        foreach ($tasks as $task) {
            if (!file_exists($task->note->full_path)) continue;
            $contents       = file_get_contents($task->note->full_path);
            $parsedown      = new Parsedown();
            $task->path     = $task->note->full_path;
            $task->markdown = $contents;
            $task->html     = $parsedown->text($contents);
        }
        return $tasks;
    }

    private function putTask(Request $request)
    {
        $id        = $request->input('id');
        $newStatus = $request->input('status');

        $task = Task::find($id);
        if ($task->status !== $newStatus) {
            $task->status = $newStatus;
            $task->save();

            $note                   = $task->note;
            $folders                = explode('/', $note->folder);
            $statusFolder           = count($folders) - 2;
            $folders[$statusFolder] = $newStatus;
            $newPath                = implode('/', $folders);
            return rename($note->full_path, $newPath);
        }

        return true;
    }

    private function postNote(Request $request)
    {
        $note       = new Note();
        $note->name = $request->input('name');
        $note->save();

        return $this->getNotes($request);
    }

    private function getNotes(Request $request)
    {
        return Note::all();
        /*foreach ($notes as $note) {
            Log::debug($note->full_path);
            $contents = file_get_contents($note->full_path);
            $parsedown = new Parsedown();
            $note->path = $note->full_path;
            $note->markdown = $contents;
            $note->html = $parsedown->text($contents);
        }
        return $notes;*/
    }

    private function putNote(Request $request)
    {
        file_put_contents($request->input('path'), $request->input('markdown'));
        return $this->getClients($request);
    }
}
