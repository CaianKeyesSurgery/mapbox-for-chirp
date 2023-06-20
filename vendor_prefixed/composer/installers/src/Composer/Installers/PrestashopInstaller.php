<?php
/**
 * @license MIT
 *
 * Modified by WebDevStudios on 16-May-2023 using Strauss.
 * @see https://github.com/BrianHenryIE/strauss
 */
namespace WebDevStudios\MBWP\Composer\Installers;

class PrestashopInstaller extends BaseInstaller
{
    protected $locations = array(
        'module' => 'modules/{$name}/',
        'theme'  => 'themes/{$name}/',
    );
}