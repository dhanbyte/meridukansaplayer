import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all global settings
export async function GET() {
    console.log('=== SETTINGS API (GET) ===');

    try {
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const { data: settings, error } = await supabase
            .from('global_settings')
            .select('*')
            .order('setting_key');

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Convert array to key-value object for easier frontend use
        const settingsMap: Record<string, string> = {};
        (settings || []).forEach((s: any) => {
            settingsMap[s.setting_key] = s.setting_value;
        });

        console.log('Settings fetched:', Object.keys(settingsMap).length);
        return NextResponse.json({
            success: true,
            settings: settingsMap,
            raw: settings
        });

    } catch (error) {
        console.error('Settings API error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT to update settings
export async function PUT(request: Request) {
    console.log('=== SETTINGS API (PUT) ===');

    try {
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { settings } = body; // Expect { settings: { key: value, ... } }

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
        }

        // Update each setting
        const updates = Object.entries(settings).map(async ([key, value]) => {
            const { error } = await supabase
                .from('global_settings')
                .upsert({
                    setting_key: key,
                    setting_value: String(value),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'setting_key'
                });

            if (error) {
                console.error(`Error updating ${key}:`, error);
                throw error;
            }
            return { key, success: true };
        });

        await Promise.all(updates);

        console.log('Settings updated successfully');
        return NextResponse.json({ success: true, message: 'Settings updated' });

    } catch (error) {
        console.error('Settings API error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
