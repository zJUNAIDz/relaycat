// app/anonymous/page.tsx
"use client"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export default function AnonymousPage() {
  const router = useRouter();
  const [newChannel, setNewChannel] = useState({ name: '', timeout: '60' });
  const [joinId, setJoinId] = useState('');

  const handleCreate = async () => {
    const res = await fetch('/api/anonymous-channel', {
      method: 'POST',
      body: JSON.stringify({ name: newChannel.name, timeout: parseInt(newChannel.timeout) }),
    });
    const data = await res.json();
    router.push(`/anonymous/${data.channelId}`);
  };

  const handleJoin = () => {
    if (joinId.trim()) router.push(`/anonymous/${joinId}`);
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="bg-zinc-800">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold">Create Anonymous Channel</h2>
            <Input
              placeholder="Channel Name (optional)"
              value={newChannel.name}
              onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
            />
            <Input
              placeholder="Timeout Duration (minutes)"
              type="number"
              value={newChannel.timeout}
              onChange={(e) => setNewChannel({ ...newChannel, timeout: e.target.value })}
            />
            <Button className="w-full" onClick={handleCreate}>Create</Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold">Join Existing Channel</h2>
            <Input
              placeholder="Channel ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <Button className="w-full" onClick={handleJoin}>Join</Button>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
