<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvacuationCenter extends Model
{
    protected $fillable = ['name', 'description', 'latitude', 'longitude'];

    public static function getNearest($latitude, $longitude, $limit = 3)
    {
        return self::selectRaw('*, 
            ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance', [$latitude, $longitude, $latitude])->orderBy('distance', 'asc')->take($limit)->get();
    }

}
