<?php

namespace App\Console\Commands;

use App\Models\Notes;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Parsedown;

class SyncNotes extends Command
{
    protected $signature = 'sync:notes';
    protected $description = 'Sync Notes';
    private Parsedown $parsedown;
    private int $startFolderIndex;

    public function __construct()
    {
        parent::__construct();
        $this->parsedown  = new Parsedown();
    }

    public function handle()
    {
        $this->line('Scan Started');

        $baseFolder = env('NOTES_FOLDER', '/Users/greg/notes') . '/notes';
        $this->startFolderIndex = strlen($baseFolder);
        $parsedown  = new Parsedown();

        $this->line('Scanning Folder: '. $baseFolder );
        $this->scan($baseFolder);
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

    /**
     * @param string $baseFolder
     */
    private function scan(string $baseFolder): void
    {
        $this->line('BASE FOLDER: '.$baseFolder);
        foreach (scandir($baseFolder) as $file) {
            $this->line('Check:'.$file);
            if ($file === '.' || $file === '..' || substr($file, 0, 1) === '.') {
                continue;
            }

            if (is_dir($baseFolder . '/' . $file)) {
                $this->line('Is FOLDER: '. $file);
                $this->scan($baseFolder . '/' . $file);
                continue;
            }

            $fullPath = $baseFolder . '/' . $file;
            $this->warn($fullPath);

            $pathInfo= pathinfo($fullPath);

            $noteRec = Notes::firstOrNew(['fullpath'=>$fullPath]);

            $noteRec->fullpath = $fullPath;
            $noteRec->dirname = substr($pathInfo['dirname'],$this->startFolderIndex);
            $noteRec->basename = $pathInfo['basename'];
            $noteRec->extension = $pathInfo['extension'];
            $noteRec->filename = $pathInfo['filename'];

            if ($noteRec->extension === 'md') {
                $noteRec->markdown = file_get_contents($noteRec->fullpath);
                $noteRec->html = $this->parsedown->text($noteRec->markdown);
            }

            $noteRec->save();

        }
    }
}
