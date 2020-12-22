<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Zibios\WrikePhpSdk\ApiFactory;

class SnSync extends Command
{
    protected $signature = 'sn:sync';

    protected $description = 'Command description';

    public function handle()
    {
        $api = ApiFactory::create('eyJ0dCI6InAiLCJhbGciOiJIUzI1NiIsInR2IjoiMSJ9.eyJkIjoie1wiYVwiOjEwMTc0MzcsXCJpXCI6NzM2Nzg2NCxcImNcIjo0NjIyNTU4LFwidVwiOjg2NTQ3OTgsXCJyXCI6XCJVU1wiLFwic1wiOltcIldcIixcIkZcIixcIklcIixcIlVcIixcIktcIixcIkNcIixcIkRcIixcIk1cIixcIkFcIixcIkxcIixcIlBcIl0sXCJ6XCI6W10sXCJ0XCI6MH0iLCJpYXQiOjE2MDgzMzM3ODl9.Amf_zH_KpcRnSp6sqCZrBiv4RHE8wy81951pa0LZ3zw'); // @see zibios/wrike-php-sdk
        //dd($api->getFolderResource()->getAll());
        //dd($api->getTaskResource()->getAllForFolder('IEAA7BS5I4QDPWMO'));
        //dd($api->getTaskResource()->getById('IEAA7BS5KQSF5NP2'));
        //dd($api->getTaskResource()->getAll(['permalink'=>'https://www.wrike.com/open.htm?id=610186746']));
        dd($api->getTaskResource()->getAll(['responsibles'=>['KUAF34EG']]));
        //
    }
}
