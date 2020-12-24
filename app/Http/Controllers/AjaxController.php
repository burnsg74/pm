<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Event;
use App\Models\Note;
use App\Models\Project;
use App\Models\Task;
use App\Models\WorkLog;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Parsedown;

class AjaxController extends Controller
{
    public function __invoke(Request $request, $item, $id = null)
    {
        try {
            $function = strtolower($request->method()) . ucwords($item);
            $payload  = $this->$function($request, $id);
            Log::debug("Function: {$function}");
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

    private function putClientnotes(Request $request)
    {
        $parsedown     = new Parsedown();
        $id            = $request->get('id');
        $note_markdown = $request->get('markdown');

        $project                        = Project::find($id);
        $project->client_notes_markdown = $note_markdown;
        $project->client_notes_html     = $parsedown->text($project->client_notes_markdown);
        $project->save();

        $meta    = "<meta name='name' content='{$project->name}'>" . PHP_EOL;
        $content = $meta . PHP_EOL . $note_markdown;
        file_put_contents($project->folder . '/client-notes.md', $content);

        return $project->client_notes_html;
    }

    private function putClientorder(Request $request)
    {
        $clients = $request->get('clients');
        $order   = 1;
        foreach ($clients as $client) {
            $dbRecord        = Client::find($client['id']);
            $dbRecord->order = $order;
            $dbRecord->save();

            $note_markdown = file_get_contents($dbRecord->note->full_path);
            $note_markdown = $this->removeMetas($note_markdown);

            $meta    = "<meta name='name' content='{$dbRecord->name}'>" . PHP_EOL;
            $meta    .= "<meta name='started_at' content='{$dbRecord->started_at}'>" . PHP_EOL;
            $meta    .= "<meta name='order' content='{$dbRecord->order}'>" . PHP_EOL;
            $meta    .= "<meta name='status' content='{$dbRecord->status}'>" . PHP_EOL;
            $content = $meta . PHP_EOL . $note_markdown;
            file_put_contents($dbRecord->note->full_path, $content);

            $order++;
        }

        return true;
    }

    private function removeMetas($content)
    {
        $newContent = '';
        foreach (preg_split("/(^[\r\n]|[\r\n]|[\n])[\s\t][\r\n]/", $content) as $line) {
            if (substr($line, 0, 6) === '<meta ') {
                continue;
            }
            $newContent .= $line . PHP_EOL;
        }
        return $newContent;
    }

    private function putTaskorder(Request $request)
    {
        $status = $request->get('status');
        $tasks  = $request->get('tasks');
        $order  = 1;

        foreach ($tasks as $task) {
            $dbRecord         = Task::find($task['id']);
            $dbRecord->status = $status;
            $dbRecord->order  = $order;

            if ($status === 'Done') {
                $dbRecord->completed_at = date('Y-m-d H:i:s');
            } else {
                $dbRecord->completed_at = null;
            }

            $dbRecord->save();

            $meta    = "<meta name='name' content='{$dbRecord->name}'>" . PHP_EOL;
            $meta    .= "<meta name='code' content='{$dbRecord->code}'>" . PHP_EOL;
            $meta    .= "<meta name='started_at' content='{$dbRecord->started_at}'>" . PHP_EOL;
            $meta    .= "<meta name='completed_at' content='{$dbRecord->completed_at}'>" . PHP_EOL;
            $meta    .= "<meta name='duration' content='{$dbRecord->duration}'>" . PHP_EOL;
            $meta    .= "<meta name='order' content='{$order}'>" . PHP_EOL;
            $meta    .= "<meta name='status' content='{$dbRecord->status}'>" . PHP_EOL;
            $content = $meta . PHP_EOL . $dbRecord->note_markdown;
            file_put_contents($dbRecord->folder, $content);

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
        $projects = Project::where('status', 'Active')->orderBy('order')->orderBy('updated_at')->get();
        foreach ($projects as $key => $project) {
            $projects[$key]->statuses = json_decode($project->statuses);
            foreach ($projects[$key]->statuses as $status) {
                $tasks[$status] = Task::where('status', $status)
                                      ->where('project_id', $project->id)
                                      ->where('completed_at')
                                      ->where(
                                          function ($query) {
                                              $query->whereNull('completed_at')
                                                    ->orWhereDate('completed_at', '>', Carbon::now()->subDays(14));
                                          }
                                      )
                                      ->orderBy('order')
                                      ->orderBy('updated_at')
                                      ->get();
            }
            $projects[$key]->tasks = $tasks;
        }
        return $projects;
    }

    private function putProjectnotes(Request $request)
    {
        $parsedown     = new Parsedown();
        $id            = $request->get('id');
        $note_markdown = $request->get('markdown');

        $project                         = Project::find($id);
        $project->project_notes_markdown = $note_markdown;
        $project->project_notes_html     = $parsedown->text($project->project_notes_markdown);
        $project->save();

        $meta    = "<meta name='name' content='{$project->name}'>" . PHP_EOL;
        $meta    .= "<meta name='started_at' content='{$project->started_at}'>" . PHP_EOL;
        $meta    .= "<meta name='order' content='{$project->order}'>" . PHP_EOL;
        $meta    .= "<meta name='status' content='{$project->status}'>" . PHP_EOL;
        $content = $meta . PHP_EOL . $note_markdown;
        file_put_contents($project->folder . '/project-notes.md', $content);

        return $project->project_notes_html;
    }

    private function postTask(Request $request)
    {
        $id   = $request->input('id');
        $task = $request->input('task');

        $parsedown = new Parsedown();
        $project   = Project::find($id);

        // 2020-12-01-19-34-01-Add-Something
        $ticketFilename = date('Y-m-d-H-i-s-') . str_replace(' ', '-', $task['name']) . '.md';
        $meta           = "<meta name='name' content='{$task['name']}'>" . PHP_EOL;
        $meta           .= "<meta name='code' content='{$task['code']}'>" . PHP_EOL;
        $meta           .= "<meta name='status' content='{$task['status']}'>" . PHP_EOL;
        $fullPath       = $project->folder . '/tasks/' . $ticketFilename;
        $content        = $meta . PHP_EOL . $task['markdown'];

        if (!file_exists($project->folder . '/tasks')) {
            mkdir($project->folder . '/tasks', 0777, true);
        }

        file_put_contents($fullPath, $content);

        $taskRec                = new Task();
        $taskRec->project_id    = $id;
        $taskRec->code          = strtoupper($task['code']);
        $taskRec->name          = $task['name'];
        $taskRec->status        = $task['status'];
        $taskRec->folder        = $fullPath;
        $taskRec->note_markdown = $task['markdown'];
        $taskRec->note_html     = $parsedown->text($taskRec->note_markdown);
        $taskRec->save();

        return $taskRec;
    }

    private function deleteTask(Request $request, $id)
    {
        Task::find($id)->delete();
    }

    private function putTask(Request $request)
    {
        $parsedown = new Parsedown();

        $id                  = $request->input('id');
        $code                = $request->input('code');
        $name                = $request->input('name');
        $note_markdown       = $request->input('note_markdown');
        $scratchpad_markdown = $request->input('scratchpad_markdown', '');
        $status              = $request->input('status');
        //$worklogStart        = $request->input('worklog_start', null);
        //$worklogEnd          = $request->input('worklog_end', null);

        $task                      = Task::find($id);
        $task->name                = $name;
        $task->code                = $code;
        $task->status              = $status;
        $task->note_markdown       = $note_markdown;
        $task->note_html           = $parsedown->text($task->note_markdown);
        $task->scratchpad_markdown = $scratchpad_markdown;
        $task->scratchpad_html     = $parsedown->text($task->scratchpad_markdown);
        $task->save();

        $meta     = "<meta name='name' content='{$task['name']}'>" . PHP_EOL;
        $meta     .= "<meta name='code' content='{$task['code']}'>" . PHP_EOL;
        $meta     .= "<meta name='status' content='{$task['status']}'>" . PHP_EOL;
        $fullPath = $task->folder;
        $content  = $meta . PHP_EOL . $task->note_markdown;

        if (!empty($task->scratchpad_markdown)) {
            $content .= PHP_EOL . PHP_EOL . '## SCRATCHPAD' . PHP_EOL . $task->scratchpad_markdown;
        }

        $worklogRecs = WorkLog::where('task_id', $task->id)->get();
        if ($worklogRecs) {
            $content .= PHP_EOL . PHP_EOL . '## WORKLOG' . PHP_EOL;
            foreach ($worklogRecs as $worklogRec) {
                $data    = [
                    'start' => $worklogRec->event->start_at,
                    'end'   => $worklogRec->event->end_at,
                ];
                $content .= json_encode($data) . PHP_EOL;
            }
        }

        file_put_contents($fullPath, $content);

        return $task;

        /*if ($worklogStart) {
            $event           = new Event();
            $event->name     = "Worked on task {$task->code}";
            $event->timed    = 1;
            $event->start_at = Carbon::parse($worklogStart)->format('Y-m-d H:i:s');
            $event->end_at   = Carbon::parse($worklogEnd)->format('Y-m-d H:i:s');
            $event->save();

            $worklogRec           = new WorkLog();
            $worklogRec->task_id  = $task->id;
            $worklogRec->event_id = $event->id;
            $worklogRec->save();
        }

        if ($task->status !== $newStatus) {
            $folders                = explode('/', $task->folder);
            $statusFolder           = count($folders) - 2;
            $folders[$statusFolder] = $newStatus;
            $newFolder              = implode('/', $folders);
            $newPath                = $newFolder . '/index.md';

            if (is_dir($newFolder)) {
                system("rm -rf " . escapeshellarg($newFolder));
            }

            mkdir($newFolder, 0777, true);
            rename($task->folder . '/index.md', $newPath);

            if (is_dir($task->folder)) {
                system("rm -rf " . escapeshellarg($task->folder));
            }

            $task->folder = $newFolder;
            $task->status = $newStatus;

        }

        if (strtolower($task->code) !== strtolower($code)) {
            $folders                = explode('/', $task->folder);
            $ticketFolder           = count($folders) - 1;
            $folders[$ticketFolder] = strtolower($task->code);
            $newFolder              = implode('/', $folders);
            $newPath                = $newFolder . '/index.md';

            if (is_dir($newFolder)) {
                system("rm -rf " . escapeshellarg($newFolder));
            }

            mkdir($newFolder, 0777, true);
            rename($task->folder . '/index.md', $newPath);
            $task->folder = $newFolder;
            $task->code   = strtoupper($code);
        }*/
        /*$started_at   = $request->input('started_at') ?? '';
        $completed_at = $request->input('completed_at') ?? '';
        $duration     = $request->input('duration') ?? 15;
        $order        = $request->input('order') ?? 0;
        $meta         = "<meta name='name' content='{$name}'>" . PHP_EOL;
        $meta         .= "<meta name='started_at' content='{$started_at}'>" . PHP_EOL;
        $meta         .= "<meta name='completed_at' content='{$completed_at}'>" . PHP_EOL;
        $meta         .= "<meta name='duration' content='{$duration}'>" . PHP_EOL;
        $meta         .= "<meta name='order' content='{$order}'>" . PHP_EOL;
        $content      = $meta . PHP_EOL. PHP_EOL . $note_markdown;

        if (strlen($scratchpad_markdown) > 0) {
            $content .= PHP_EOL . PHP_EOL . '## SCRATCHPAD' . PHP_EOL . $scratchpad_markdown;
        }

        $content .= PHP_EOL . PHP_EOL . '## WORKLOG' . PHP_EOL ;
        $worklogRecs = WorkLog::where('task_id',$task->id)->get();
        foreach ($worklogRecs as $worklogRec) {
            $data = [
                'start' => $worklogRec->event->start_at,
                'end' => $worklogRec->event->end_at,
            ];
            $content .= json_encode($data) . PHP_EOL;
        }

        file_put_contents($task->folder . '/index.md', $content);

        $res = [];
        $res['task'] = $task->toArray();
        if ($worklogStart) {
            $res['event'] = $event->toArray();
        }
        return $res;*/
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
            $note->note_markdown = $contents;
            $note->note_html = $parsedown->text($contents);
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

    private function postOpenClientNotes(Request $request)
    {
        $id            = $request->get('id');
        $project       = Project::find($id);
        $notesFullPath = $project->folder . '/client-notes.md';
        exec("vimr {$notesFullPath}");

        return true;
    }

    private function postOpenProjectNotes(Request $request)
    {
        $id            = $request->get('id');
        $project       = Project::find($id);
        $notesFullPath = $project->folder . '/project-notes.md';
        exec("vimr {$notesFullPath}");

        return true;
    }

    private function postOpenTask(Request $request)
    {
        $id            = $request->get('id');
        $task       = Task::find($id);
        exec("vimr {$task->folder}");

        return true;
    }


}
