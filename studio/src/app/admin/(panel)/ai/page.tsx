import { AiSettingsForm } from "@/components/admin/AiSettings";
import { getAiSettings, getLog, maskKey } from "@/lib/ai";

export default async function AiPage() {
  const [s, log] = await Promise.all([getAiSettings(), getLog()]);
  return (
    <AiSettingsForm
      log={log}
      initial={{
        ai: { claudeModel: s.claudeModel, imageModel: s.imageModel, imageSize: s.imageSize, claudeBaseUrl: s.claudeBaseUrl, openaiBaseUrl: s.openaiBaseUrl, claudeKeyMask: maskKey(s.claudeKey), openaiKeyMask: maskKey(s.openaiKey) },
        envKeys: { claude: !!process.env.ANTHROPIC_API_KEY, openai: !!process.env.OPENAI_API_KEY },
      }}
    />
  );
}
