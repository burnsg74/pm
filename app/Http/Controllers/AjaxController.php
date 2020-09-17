<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Note;
use App\Models\Project;
use App\Models\Task;
use Exception;
use Illuminate\Http\Request;

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
        return Client::all();
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
        return Project::all();
    }

    private function postTask(Request $request)
    {
        $task       = new Task();
        $task->code = $request->input('code');
        $task->name = $request->input('name');
        $task->save();

        return $this->getTasks($request);
    }

    private function putTask(Request $request)
    {
        $task       = Task::find($request->input('id'));
        $task->code = $request->input('code');
        $task->name = $request->input('name');
        $task->description = $request->input('description');
        $task->save();

        return $this->getTasks($request);
    }

    private function getTasks(Request $request)
    {
        return Task::all();
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
    }
}
