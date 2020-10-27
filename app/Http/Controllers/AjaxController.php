<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Event;
use App\Models\Note;
use App\Models\Project;
use App\Models\Task;
use App\Models\WorkLog;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Parsedown;

class AjaxController extends Controller
{
    public function __invoke(Request $request, $item, $id = null)
    {
        try {
            $function = strtolower($request->method()) . ucwords($item);
            $payload  = $this->$function($request, $id);
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
        $res     = [];
        $clients = Client::where('status', 'Active')->orderBy('order')->orderBy('updated_at')->get();
        foreach ($clients as $client) {
            $item             = $client->toArray();
            $item['projects'] = [];
            foreach ($client->projects as $project) {
                $p          = $project->toArray();
                $p['tasks'] = [
                    'Backlog'     => [],
                    'In-Progress' => [],
                    'Hold'        => [],
                    'Done'        => []
                ];
                foreach ($project->tasks as $task) {
                    $t                           = $task->toArray();
                    foreach ($task->worklogs as $worklog) {
                       $t['worklogs'][] = $worklog->toArray();
                    }
                    foreach ($task->history as $history) {
                        $t['history'][] = $history->toArray();
                    }
                    $p['tasks'][$task->status][] = $t;
                }
                $item['projects'][] = $p;
            }

            $res[] = $item;
        }

        return $res;
    }

    private function putClient(Request $request)
    {
        $id    = $request->get('id');
        $notes = $request->get('notes');

        $client        = Client::find($id);
        $client->notes = $notes;
        $client->save();

        return $client;
    }

    private function removeWorklogs($task, string $content)
    {
        $newContent        = '';
        $isWorklogsSection = false;
        foreach (preg_split("/(^[\r\n]*|[\r\n]*|[\n]+)[\s\t]*[\r\n]+/", $content) as $line) {
            if (strlen($line) > 6 && strpos($line, '# Worklog')) {
                $isWorklogsSection = true;
                $recs              = WorkLog::where('task_id', $task->id)->get();
                foreach ($recs as $rec) {
                    $event = Event::find($rec->event_id);
                    $rec->delete();
                    if ($event) {
                        $event->delete();
                    }
                }
                continue;
            }
            if ($isWorklogsSection === false) {
                $newContent .= $line . PHP_EOL;
                continue;
            }
            if (strlen($line) > 2 && strpos($line, '# ')) {
                $isWorklogsSection = false;
            }

            // Start DTG, End DTG, Name
            $data = explode(',', $line);
            if (empty($data[0]) || empty($data[1]) || empty($data[2])) {
                continue;
            }

            $event           = new Event();
            $event->name     = $data[2] ?? 'Worklog';
            $event->color    = 'black';
            $event->timed    = 1;
            $event->start_at = $data[0];
            $event->end_at   = $data[1];
            $event->save();

            $worklog           = new WorkLog();
            $worklog->task_id  = $task->id;
            $worklog->event_id = $event->id;
            $worklog->save();
        }
        return $newContent;
    }

    private function removeHistory(string $content)
    {
        return $content;
    }

    private function putClientnote(Request $request)
    {
        $parsedown = new Parsedown();
        $id        = $request->get('id');
        $markdown  = $request->get('markdown');

        $client = Client::find($id);
        $note   = Note::find($client->note_id);

        $meta    = "<meta name='name' content='{$client->name}'>" . PHP_EOL;
        $meta    .= "<meta name='started_at' content='{$client->started_at}'>" . PHP_EOL;
        $meta    .= "<meta name='order' content='{$client->order}'>" . PHP_EOL;
        $meta    .= "<meta name='status' content='{$client->status}'>" . PHP_EOL;
        $content = $meta . PHP_EOL . $markdown;

        file_put_contents($note->full_path, $content);

        return $parsedown->text($markdown);
    }

    private function putClientorder(Request $request)
    {
        $clients = $request->get('clients');
        $order   = 1;
        foreach ($clients as $client) {
            $dbRecord        = Client::find($client['id']);
            $dbRecord->order = $order;
            $dbRecord->save();

            $markdown = file_get_contents($dbRecord->note->full_path);
            $markdown = $this->removeMetas($markdown);

            $meta    = "<meta name='name' content='{$dbRecord->name}'>" . PHP_EOL;
            $meta    .= "<meta name='started_at' content='{$dbRecord->started_at}'>" . PHP_EOL;
            $meta    .= "<meta name='order' content='{$dbRecord->order}'>" . PHP_EOL;
            $meta    .= "<meta name='status' content='{$dbRecord->status}'>" . PHP_EOL;
            $content = $meta . PHP_EOL . $markdown;
            file_put_contents($dbRecord->note->full_path, $content);

            $order++;
        }

        return true;
    }

    private function removeMetas($content)
    {
        $newContent = '';
        foreach (preg_split("/(^[\r\n]*|[\r\n]*|[\n]+)[\s\t]*[\r\n]+/", $content) as $line) {
            if (substr($line, 0, 6) === '<meta ') {
                continue;
            }
            $newContent .= $line . PHP_EOL;
        }
        return $newContent;
    }

    private function putTaskorder(Request $request)
    {
        $tasks = $request->get('tasks');
        $order = 1;
        foreach ($tasks as $task) {
            $dbRecord        = Task::find($task['id']);
            $dbRecord->order = $order;
            $dbRecord->save();

            $markdown = file_get_contents($dbRecord->note->full_path);
            $markdown = $this->removeMetas($markdown);
            $meta     = "<meta name='name' content='{$dbRecord->name}'>" . PHP_EOL;
            $meta     .= "<meta name='started_at' content='{$dbRecord->started_at}'>" . PHP_EOL;
            $meta     .= "<meta name='completed_at' content='{$dbRecord->completed_at}'>" . PHP_EOL;
            $meta     .= "<meta name='duration' content='{$dbRecord->duration}'>" . PHP_EOL;
            $meta     .= "<meta name='order' content='{$order}'>" . PHP_EOL;
            $content  = $meta . PHP_EOL . $markdown;
            file_put_contents($dbRecord->note->full_path, $content);

            $order++;
        }

        return true;
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

    private function putProjectnote(Request $request)
    {
        $parsedown = new Parsedown();
        $id        = $request->get('id');
        $markdown  = $request->get('markdown');

        $project = Project::find($id);
        $note    = Note::find($project->note_id);

        /*$meta     = "<meta name='name' content='{$client->started_at}'>" . PHP_EOL;
        $meta     .= "<meta name='order' content='{$client->order}'>" . PHP_EOL;
        $meta     .= "<meta name='status' content='{$client->status}'>" . PHP_EOL;
        $content  = $meta . PHP_EOL . $markdown;*/

        file_put_contents($note->full_path, $markdown);

        return $parsedown->text($markdown);
    }

    private function postTask(Request $request)
    {
        $code         = $request->input('code');
        $name         = $request->input('name');
        $notes        = $request->input('notes');
        $started_at   = $request->input('started_at') ?? null;
        $completed_at = $request->input('completed_at') ?? null;
        $duration     = $request->input('duration') ?? 15;
        $order        = $request->input('order') ?? 0;
        $status       = $request->input('status');
        $client       = Client::find($request->input('client_id'));
        $project      = Project::find($request->input('project_id'));


        $task               = new Task();
        $task->client_id    = $client->id;
        $task->project_id   = $project->id;
        $task->code         = strtoupper($code);
        $task->name         = $name;
        $task->status       = $status;
        $task->notes        = $notes;
        $task->order        = $order;
        $task->started_at   = $started_at;
        $task->completed_at = $completed_at;
        $task->duration     = $duration;
        $task->save();

        return $task;
    }

    private function deleteTask(Request $request, $id)
    {
        Task::find($id)->delete();
    }

    private function putTask(Request $request)
    {
        $code         = $request->input('code');
        $name         = $request->input('name');
        $notes        = $request->input('notes');
        $started_at   = $request->input('started_at') ?? null;
        $completed_at = $request->input('completed_at') ?? null;
        $duration     = $request->input('duration') ?? 15;
        $order        = $request->input('order') ?? 0;
        $status       = $request->input('status');

        $task    = Task::find($request->input('id'));
        $client  = Client::find($request->input('client_id'));
        $project = Project::find($request->input('project_id'));

        $task->client_id    = $client->id;
        $task->project_id   = $project->id;
        $task->code         = strtoupper($code);
        $task->name         = $name;
        $task->status       = $status;
        $task->notes        = $notes;
        $task->order        = $order;
        $task->started_at   = $started_at;
        $task->completed_at = $completed_at;
        $task->duration     = $duration;
        $task->save();

        return $task;
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

    private function getEvents(Request $request)
    {
        return Event::all();
    }

    private function putNote(Request $request)
    {
        file_put_contents($request->input('path'), $request->input('markdown'));
        return $this->getClients($request);
    }
}
