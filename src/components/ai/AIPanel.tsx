import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/appStore';
import { AgentConfig } from 'worker/types';
import { ArrowRight, Bot, Loader2, Sparkles } from 'lucide-react';
const MODELS = {
  gemini: [
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
  ],
  openrouter: [
    { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (OpenRouter)' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (OpenRouter)' },
  ],
};
const AgentCard: React.FC<{ index: number }> = ({ index }) => {
  const agentConfig = useAppStore((s) => s.agentConfigs[index]);
  const updateAgentConfig = useAppStore((s) => s.updateAgentConfig);
  const handleUpdate = (key: keyof AgentConfig, value: any) => {
    updateAgentConfig(index, { [key]: value });
  };
  return (
    <div className="p-4 border rounded-lg bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <Label className="text-lg font-semibold">Agent {index + 1}</Label>
        </div>
        <Switch
          checked={agentConfig.enabled}
          onCheckedChange={(checked) => handleUpdate('enabled', checked)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`prompt-${index}`}>Prompt</Label>
        <Textarea
          id={`prompt-${index}`}
          placeholder={`Enter prompt for Agent ${index + 1}...`}
          value={agentConfig.prompt}
          onChange={(e) => handleUpdate('prompt', e.target.value)}
          className="min-h-[100px]"
          disabled={!agentConfig.enabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`model-${index}`}>Model</Label>
        <Select
          value={agentConfig.model}
          onValueChange={(value) => handleUpdate('model', value)}
          disabled={!agentConfig.enabled}
        >
          <SelectTrigger id={`model-${index}`}>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <optgroup label="Google Gemini (via Cloudflare)">
              {MODELS.gemini.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </optgroup>
            <optgroup label="OpenRouter">
              {MODELS.openrouter.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </optgroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
export const AIPanel: React.FC<{ onGenerate: (configs: AgentConfig[]) => void }> = ({ onGenerate }) => {
  const isOpen = useAppStore((s) => s.isAIPanelOpen);
  const toggleAIPanel = useAppStore((s) => s.toggleAIPanel);
  const agentConfigs = useAppStore((s) => s.agentConfigs);
  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(agentConfigs);
      toggleAIPanel();
    } catch (error) {
      console.error("Generation failed:", error);
      // You might want to show a toast notification here
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={toggleAIPanel}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-display">AI Agent Chain</SheetTitle>
          <SheetDescription>
            Configure up to 4 AI agents to run in sequence. The output of one becomes the input for the next.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow -mx-6 px-6">
          <div className="space-y-4 py-4">
            <AgentCard index={0} />
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <AgentCard index={1} />
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <AgentCard index={2} />
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <AgentCard index={3} />
          </div>
        </ScrollArea>
        <SheetFooter>
          <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Text
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};