<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(config('aerohandling.pagination.notifications', 20));

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'nonLues' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function marquerLue(Request $request, string $id): \Illuminate\Http\RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    public function marquerToutesLues(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
