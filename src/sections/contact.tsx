import { useState } from 'react';
import { Send, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';

export function Contact() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bikeType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', bikeType: '', message: '' });
    }, 3000);
  };

  return (
    <section id="kontakt" className="py-24 bg-[#090909]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-[#4A6AEE] uppercase mb-3 block font-medium">
              Kontakt
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.contact.title}
            </h2>
            <p className="text-[#8896B0]">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'email'
                  ? 'bg-[#4A6AEE] text-white'
                  : 'bg-[#18181E] text-[#8896B0] hover:bg-[#18181E]'
              }`}
            >
              <Send className="h-4 w-4" />
              {t.contact.tabEmail}
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'whatsapp'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#18181E] text-[#8896B0] hover:bg-[#18181E]'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              {t.contact.tabWhatsapp}
            </button>
          </div>

          {/* Email Form */}
          {activeTab === 'email' && (
            <div className="bg-[#111117] border border-[#22222E]/30 rounded-xl p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    {t.contact.success}
                  </h3>
                  <p className="text-[#8896B0]">
                    {t.contact.successSub}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#8896B0] mb-2 block text-sm">{t.contact.name} *</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-[#111117]/50 border-[#22222E]/50 text-white placeholder:text-[#52576A]"
                      />
                    </div>
                    <div>
                      <Label className="text-[#8896B0] mb-2 block text-sm">{t.contact.email} *</Label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-[#111117]/50 border-[#22222E]/50 text-white placeholder:text-[#52576A]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#8896B0] mb-2 block text-sm">{t.contact.bikeType}</Label>
                    <Input
                      placeholder={t.contact.bikeType}
                      value={formData.bikeType}
                      onChange={(e) => setFormData({ ...formData, bikeType: e.target.value })}
                      className="bg-[#111117]/50 border-[#22222E]/50 text-white placeholder:text-[#52576A]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#8896B0] mb-2 block text-sm">{t.contact.message} *</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder={t.contact.message}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-[#111117]/50 border-[#22222E]/50 text-white placeholder:text-[#52576A]"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#4A6AEE] hover:bg-[#6478F5]">
                    <Send className="h-4 w-4 mr-2" />
                    {t.contact.send}
                  </Button>

                  <p className="text-[#52576A] text-xs text-center">
                    {t.contact.emailTo}
                  </p>
                </form>
              )}
            </div>
          )}

          {/* WhatsApp */}
          {activeTab === 'whatsapp' && (
            <div className="bg-[#111117] border border-[#22222E]/30 rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                {t.contact.whatsappTitle}
              </h3>
              <p className="text-[#8896B0] mb-6">
                {t.contact.whatsappDesc}
              </p>
              <a
                href="https://wa.me/4915751957470"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t.contact.whatsappCta}
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
