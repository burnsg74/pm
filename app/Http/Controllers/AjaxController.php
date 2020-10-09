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

    private function getClients(Request $request)
    {
        $parsedown = new Parsedown();
        $res       = [];
        $clients   = Client::where('status','Active')->orderBy('updated_at')->get();
        foreach ($clients as $client) {
            $item = $client->toArray();
            if (file_exists($client->note->full_path)) {
                $content         = file_get_contents($client->note->full_path);
                $item['path']     = $client->note->full_path;
                $item['markdown'] = $this->removeMetas($content);
                $item['html']     = $parsedown->text($content);
            }

            $item['projects'] = [];
            foreach ($client->projects as $project) {
                $p = $project->toArray();
                if (file_exists($project->note->full_path)) {
                    $content      = file_get_contents($project->note->full_path);
                    $p['path']     = $project->note->full_path;
                    $p['markdown'] = $this->removeMetas($content);
                    $p['html']     = $parsedown->text($content);
                }
                $p['tasks'] = [
                    'Backlog'     => [],
                    'In-Progress' => [],
                    'Hold'        => [],
                    'Done'        => []
                ];
                foreach ($project->tasks as $task) {
                    $t = $task->toArray();
                    if (file_exists($task->note->full_path)) {
                        $content      = file_get_contents($task->note->full_path);
                        $t['path']     = $task->note->full_path;
                        $t['markdown'] = $this->removeMetas($content);
                        $t['html']     = $parsedown->text($content);
                    }
                    $p['tasks'][$task->status][] = $t;
                }
                $item['projects'][] = $p;
            }

            $res[] = $item;
        }

        return $res;
    }

    private function postProject(Request $request)
    {
        $project       = new Project();
        $project->code = $request->input('code');
        $project->name = $request->input('name');
        $project->save();

        return $this->getProjects($request);
    }

    private function putProjectnote(Request $request)
    {
        $parsedown = new Parsedown();
        $id        = $request->get('id');
        $markdown  = $request->get('markdown');

        $project = Project::find($id);
        $note   = Note::find($project->note_id);

        /*$meta     = "<meta name='name' content='{$client->started_at}'>" . PHP_EOL;
        $meta     .= "<meta name='order' content='{$client->order}'>" . PHP_EOL;
        $meta     .= "<meta name='status' content='{$client->status}'>" . PHP_EOL;
        $content  = $meta . PHP_EOL . $markdown;*/

        file_put_contents($note->full_path, $markdown);

        return $parsedown->text($markdown);
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
        $code         = $request->input('code');
        $name         = $request->input('name');
        $markdown     = $request->input('markdown');
        $started_at   = $request->input('started_at') ?? '';
        $completed_at = $request->input('completed_at') ?? '';
        $duration     = $request->input('duration') ?? 15;
        $order        = $request->input('order') ?? 0;
        $status       = $request->input('status');

        $client      = Client::find($request->input('client_id'));
        $clientCode  = strtolower($client->code);
        $project     = Project::find($request->input('project_id'));
        $projectCode = strtolower($project->code);


        $meta     = "<meta name='name' content='{$name}'>" . PHP_EOL;
        $meta     .= "<meta name='started_at' content='{$started_at}'>" . PHP_EOL;
        $meta     .= "<meta name='completed_at' content='{$completed_at}'>" . PHP_EOL;
        $meta     .= "<meta name='duration' content='{$duration}'>" . PHP_EOL;
        $meta     .= "<meta name='order' content='{$order}'>" . PHP_EOL;
        $fullPath = "/Users/greg/notes/clients/{$clientCode}/projects/{$projectCode}/tasks/{$status}/" . strtolower(
                $code
            );
        $content  = $meta . PHP_EOL . $markdown;

        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);
        }

        $fullPath = $fullPath . "/index.md";
        file_put_contents($fullPath, $content);

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
        $task->code       = strtoupper($code);
        $task->name       = $name;
        $task->status     = $status;
        $task->save();

        $contents       = file_get_contents($task->note->full_path);
        $parsedown      = new Parsedown();
        $task->path     = $task->note->full_path;
        $task->markdown = $contents;
        $task->html     = $parsedown->text($contents);

        return $task;
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
        $parsedown = new Parsedown();

        $id        = $request->input('id');
        $code      = $request->input('code');
        $name      = $request->input('name');
        $markdown  = $request->input('markdown');
        $newStatus = $request->input('status');

        $task = Task::find($id);
        $note = $task->note;

        if ($task->status !== $newStatus) {
            $folders                = explode('/', $note->folder);
            $statusFolder           = count($folders) - 2;
            $folders[$statusFolder] = $newStatus;
            $newPath                = implode('/', $folders) . '/index.md';
            mkdir(implode('/', $folders), 0777, true);
            rename($note->full_path, $newPath);
            $note->full_path = $newPath;
            $task->status    = $newStatus;
        }

        if (strtolower($task->code) !== strtolower($code)) {
            $folders                = explode('/', $note->folder);
            $ticketFolder           = count($folders) - 1;
            $folders[$ticketFolder] = strtolower($task->code);
            $newPath                = implode('/', $folders) . '/index.md';
            mkdir(implode('/', $folders), 0777, true);
            rename($note->full_path, $newPath);
            $note->full_path = $newPath;
            $task->code      = strtoupper($code);
        }

        $note->save();

        $task->name = $name;
        $task->save();

        $started_at   = $request->input('started_at') ?? '';
        $completed_at = $request->input('completed_at') ?? '';
        $duration     = $request->input('duration') ?? 15;
        $order        = $request->input('order') ?? 0;
        $meta         = "<meta name='name' content='{$name}'>" . PHP_EOL;
        $meta         .= "<meta name='started_at' content='{$started_at}'>" . PHP_EOL;
        $meta         .= "<meta name='completed_at' content='{$completed_at}'>" . PHP_EOL;
        $meta         .= "<meta name='duration' content='{$duration}'>" . PHP_EOL;
        $meta         .= "<meta name='order' content='{$order}'>" . PHP_EOL;
        $content      = $meta . PHP_EOL . $markdown;
        file_put_contents($note->full_path, $content);

        $t = $task->toArray();
        if (file_exists($task->note->full_path)) {
            $contents      = file_get_contents($task->note->full_path);
            $t['path']     = $task->note->full_path;
            $t['markdown'] = strip_tags($contents);
            $t['html']     = $parsedown->text($contents);
        }

        return $t;
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
