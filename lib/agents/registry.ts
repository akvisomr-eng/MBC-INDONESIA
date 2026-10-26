export type AgentDefinition = {
  key: string;
  label: string;
  purpose: string;
  requiresHumanApproval: boolean;
  enabledByDefault: boolean;
};

export const agentRegistry: readonly AgentDefinition[] = [
  { key: "research_sources", label: "Riset & Sumber", purpose: "Mengumpulkan sumber dan mengaitkan klaim dengan bukti.", requiresHumanApproval: false, enabledByDefault: false },
  { key: "fact_check", label: "Pemeriksa Fakta", purpose: "Menandai klaim yang belum terverifikasi dan konflik sumber.", requiresHumanApproval: false, enabledByDefault: false },
  { key: "drafting", label: "Asisten Draf", purpose: "Menyusun draf berdasarkan bahan yang disetujui.", requiresHumanApproval: false, enabledByDefault: false },
  { key: "copy_desk", label: "Penyunting Bahasa", purpose: "Memeriksa kejelasan, ejaan, atribusi, dan konsistensi.", requiresHumanApproval: false, enabledByDefault: false },
  { key: "seo_editorial", label: "Strategi SEO", purpose: "Memberi rekomendasi metadata, struktur, dan tautan internal.", requiresHumanApproval: false, enabledByDefault: false },
  { key: "risk_review", label: "Risiko & Kepatuhan", purpose: "Menandai risiko hukum, privasi, dan etika untuk ditinjau editor.", requiresHumanApproval: true, enabledByDefault: false }
] as const;