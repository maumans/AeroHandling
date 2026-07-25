<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Set the app locale based on session
        if (Session::has('locale')) {
            App::setLocale(Session::get('locale'));
        }

        $configDesign = \Illuminate\Support\Facades\Cache::rememberForever('config_design', function () {
            $param = \App\Models\Parametre::where('cle', 'config_design')->first();
            return $param ? $param->valeur : [
                'couleur_primaire' => '#0B2545',
                'couleur_secondaire' => '#13315C',
                'logo_url' => null,
            ];
        });

        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'name' => config('app.name'),
            'configDesign' => $configDesign,
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames()->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'notificationsNonLues' => $user ? $user->unreadNotifications()->count() : 0,
            'recentNotifications' => $user ? $user->notifications()->take(5)->get() : [],
        ];
    }
}
