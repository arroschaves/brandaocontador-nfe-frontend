import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, FileText, Hash, Calendar, AlertCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardBody } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FormGroup, Input, Select, TextArea } from '../components/ui/Form';
import { ButtonLoading } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { useNFe } from '../hooks/useNFe';

const InutilizarNFe: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { inutilizarNFe, isLoading } = useNFe();

  const [serie, setSerie] = useState<string>('1');
  const [numeroInicial, setNumeroInicial] = useState<string>('');
  const [numeroFinal, setNumeroFinal] = useState<string>('');
  const [ano, setAno] = useState<string>('');
  const [justificativa, setJustificativa] = useState<string>('');

  const validar = (): boolean => {
    const s = parseInt(serie, 10);
    const nIni = parseInt(numeroInicial, 10);
    const nFim = parseInt(numeroFinal, 10);
    const just = justificativa.trim();

    if (isNaN(s) || s < 0) {
      showToast('Informe uma série válida (número inteiro).', 'error');
      return false;
    }
    if (isNaN(nIni) || isNaN(nFim)) {
      showToast('Informe números inicial e final válidos.', 'error');
      return false;
    }
    if (nIni <= 0 || nFim <= 0) {
      showToast('Números devem ser maiores que zero.', 'error');
      return false;
    }
    if (nIni > nFim) {
      showToast('Número inicial não pode ser maior que o final.', 'error');
      return false;
    }
    if (just.length < 15) {
      showToast('Justificativa deve ter pelo menos 15 caracteres.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validar()) return;

    const s = parseInt(serie, 10);
    const nIni = parseInt(numeroInicial, 10);
    const nFim = parseInt(numeroFinal, 10);

    const ok = await inutilizarNFe(s, nIni, nFim, justificativa.trim(), ano || undefined);
    if (ok) {
      // Navegar para histórico após sucesso
      navigate('/historico');
    }
  };

  return (
    <PageLayout
      title="Inutilizar NFe"
      subtitle="Homologar inutilização de numeração de NF-e"
      icon={XCircle}
    >
      <div className="space-y-6">
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <Input
                  label="Série"
                  required
                  type="number"
                  min={0}
                  leftIcon={<FileText className="h-4 w-4 text-gray-400" />}
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  placeholder="1"
                />
              </FormGroup>

              <FormGroup>
                <Input
                  label="Número Inicial"
                  required
                  type="number"
                  min={1}
                  leftIcon={<Hash className="h-4 w-4 text-gray-400" />}
                  value={numeroInicial}
                  onChange={(e) => setNumeroInicial(e.target.value)}
                  placeholder="Ex: 100"
                />
              </FormGroup>

              <FormGroup>
                <Input
                  label="Número Final"
                  required
                  type="number"
                  min={1}
                  leftIcon={<Hash className="h-4 w-4 text-gray-400" />}
                  value={numeroFinal}
                  onChange={(e) => setNumeroFinal(e.target.value)}
                  placeholder="Ex: 120"
                />
              </FormGroup>

              <FormGroup>
                <Input
                  label="Ano (opcional)"
                  type="text"
                  leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="AAAA (ex: 2025)"
                />
              </FormGroup>

              <FormGroup>
                <TextArea
                  label="Justificativa"
                  required
                  rows={4}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Descreva o motivo da inutilização (mínimo 15 caracteres)."
                />
              </FormGroup>
            </div>

            <div className="mt-6 flex justify-end">
              <ButtonLoading
                onClick={handleSubmit}
                loading={isLoading}
                className="min-w-[200px]"
              >
                Inutilizar Numeração
              </ButtonLoading>
            </div>

            <div className="mt-4 text-sm text-gray-500 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>
                Dica: a série e os números se referem à numeração de NF-e que não será utilizada. A homologação depende do certificado e do ambiente configurado.
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  );
};

export default InutilizarNFe;