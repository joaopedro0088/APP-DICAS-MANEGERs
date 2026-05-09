/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLog } from '../types';
import { storage } from '../store';
import { ChevronLeft, Calendar, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LogsViewProps {
  onBack: () => void;
}

export default function LogsView({ onBack }: LogsViewProps) {
  const [logs, setLogs] = useState<AppLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const allLogs = await storage.getLogs();
      setLogs([...allLogs].reverse());
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-[#1A1A1A] rounded-xl text-[#A0A0A0]"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold italic">Central de Logs</h2>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl p-6 space-y-4 transition-all hover:bg-[#222]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  log.type === 'update' ? 'bg-blue-500/10 text-blue-500' :
                  log.type === 'fix' ? 'bg-green-500/10 text-green-500' :
                  'bg-[#7B2CBF]/10 text-[#7B2CBF]'
                }`}>
                  {log.type}
                </span>
                <h3 className="text-lg font-bold">{log.title}</h3>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] bg-[#2D2D2D] px-2 py-0.5 rounded font-mono text-[#A0A0A0]">{log.version}</span>
              </div>
            </div>

            <p className="text-sm text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">{log.description}</p>

            <div className="flex items-center gap-4 pt-4 border-t border-[#2D2D2D] text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#7B2CBF]" />
                {new Date(log.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-[#7B2CBF]" />
                FOX MANAGERS OFFICIAL
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
