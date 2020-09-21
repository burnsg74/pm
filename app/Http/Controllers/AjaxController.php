<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Note;
use App\Models\Project;
use App\Models\Task;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            $contents = file_get_contents($client->note->full_path);
            $parsedown = new Parsedown();
            $client->path = $client->note->full_path;
            $client->markdown = $contents;
            $client->html = $parsedown->text($contents);
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
            $contents = file_get_contents($project->note->full_path);
            $parsedown = new Parsedown();
            $project->path = $project->note->full_path;
            $project->markdown = $contents;
            $project->html = $parsedown->text($contents);
        }
        return $projects;
    }

    private function postTask(Request $request)
    {
        $task       = new Task();
        $task->code = $request->input('code');
        $task->name = $request->input('name');
        $task->save();

        return $this->getTasks($request);
    }

    private function getTasks(Request $request)
    {
        $tasks = Task::all();
        foreach ($tasks as $task) {
            $contents = file_get_contents($task->note->full_path);
            $parsedown = new Parsedown();
            $task->path = $task->note->full_path;
            $task->markdown = $contents;
            $task->html = $parsedown->text($contents);
        }
        return $tasks;
    }

    private function putTask(Request $request)
    {
        $task              = Task::find($request->input('id'));
        $task->code        = $request->input('code');
        $task->name        = $request->input('name');
        $task->description = $request->input('description');
        $task->save();

        return $this->getTasks($request);
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
