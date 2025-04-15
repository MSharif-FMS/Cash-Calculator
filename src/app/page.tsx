'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Participant {
  id: string;
  has_bank_account: boolean;
  purchase_amount: number;
  gross_bank_payment?: number;
  cash_received?: number;
  net_bank_payment?: number;
  cash_contributed?: number;
}

interface CalculationResult {
  participants: Participant[];
  results: Participant[];
  timestamp: string;
  id: string;
}

const CalculationHistory = ({ history, onClose, onDelete }: { history: CalculationResult[]; onClose: () => void; onDelete: (id: string) => void }) => {
  const { t } = useLanguage();
  
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{t('reviewHistory')}</DialogTitle>
        <DialogDescription>{t('reviewPreviousCalculations')}</DialogDescription>
      </DialogHeader>
      {history.length === 0 ? (
        <p>{t('noCalculationHistory')}</p>
      ) : (
        <ScrollArea className="h-[400px] w-full">
          <div className="grid gap-4">
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{t('calculation')} {history.findIndex(h => h.id === item.id) + 1}</CardTitle>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                      {t('delete')}
                    </Button>
                  </div>
                  <CardDescription>{t('timestamp')}: {item.timestamp}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('participants')}:</p>
                  <ul>
                    {item.participants.map((p) => (
                      <li key={p.id}>
                        {p.id} - ${p.purchase_amount} - {t('bankAccount')}: {p.has_bank_account ? t('yes') : t('no')}
                      </li>
                    ))}
                  </ul>
                  <p>{t('results')}:</p>
                  <ul>
                    {item.results.map((r) => (
                      <li key={r.id}>
                        {r.id}: {t('netPayment')}: {r.net_bank_payment?.toFixed(2) || r.cash_contributed?.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      <Button onClick={onClose}>{t('close')}</Button>
    </DialogContent>
  );
};


export default function Home() {
  const { t } = useLanguage();
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', has_bank_account: true, purchase_amount: 20 },
    { id: '2', has_bank_account: false, purchase_amount: 30 },
    { id: '3', has_bank_account: true, purchase_amount: 50 },
  ]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newParticipantBankAccount, setNewParticipantBankAccount] = useState(true);
  const [newParticipantPurchaseAmount, setNewParticipantPurchaseAmount] = useState<number | ''>('');
  const [calculationResults, setCalculationResults] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [calculationHistory, setCalculationHistory] = useState<CalculationResult[]>([]);
  const [openHistory, setOpenHistory] = useState(false);

  useEffect(() => {
    const storedHistory = localStorage.getItem('calculationHistory');
    if (storedHistory) {
      setCalculationHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
  }, [calculationHistory]);

  const calculatePayments = () => {
    setError(null);

    const total_purchase = participants.reduce((sum, p) => sum + p.purchase_amount, 0);
    const bank_participants = participants.filter(p => p.has_bank_account);
    const non_bank_participants = participants.filter(p => !p.has_bank_account);

    const bank_purchases = bank_participants.reduce((sum, p) => sum + p.purchase_amount, 0);
    const cash_purchases = non_bank_participants.reduce((sum, p) => sum + p.purchase_amount, 0);

    if (bank_purchases === 0) {
      setError(t('noBankParticipants'));
      setCalculationResults([]);
      return;
    }

    const updatedBankParticipants = bank_participants.map(p => {
      const proportion = p.purchase_amount / bank_purchases;
      const gross_bank_payment = proportion * total_purchase;
      const cash_received = proportion * cash_purchases;
      const net_bank_payment = gross_bank_payment - cash_received;

      return {
        ...p,
        gross_bank_payment,
        cash_received,
        net_bank_payment,
      };
    });

    const updatedNonBankParticipants = non_bank_participants.map(p => ({
      ...p,
      cash_contributed: p.purchase_amount,
    }));

    const results = [...updatedBankParticipants, ...updatedNonBankParticipants];
    setCalculationResults(results);

    const newCalculation: CalculationResult = {
      id: Date.now().toString(),
      participants: [...participants],
      results: results,
      timestamp: new Date().toLocaleString(),
    };

    setCalculationHistory(prevHistory => [...prevHistory, newCalculation]);
  };

  const addParticipant = () => {
    if (!newParticipantId || newParticipantPurchaseAmount === '') {
      alert(t('fillAllFields'));
      return;
    }

    const newAmount = Number(newParticipantPurchaseAmount);
    if (isNaN(newAmount)) {
      alert(t('enterValidAmount'));
      return;
    }

    const newParticipant: Participant = {
      id: newParticipantId,
      has_bank_account: newParticipantBankAccount,
      purchase_amount: newAmount,
    };

    setParticipants([...participants, newParticipant]);
    setNewParticipantId('');
    setNewParticipantBankAccount(false);
    setNewParticipantPurchaseAmount('');
  };

  const handleDeleteParticipant = (id: string) => {
    const updatedParticipants = participants.filter(participant => participant.id !== id);
    setParticipants(updatedParticipants);
    setCalculationResults([]);
    setError(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updatedHistory = calculationHistory.filter(item => item.id !== id);
    setCalculationHistory(updatedHistory);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('appName')}</CardTitle>
          <CardDescription>{t('participants')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="participant-id">{t('participantId')}</Label>
            <Input
              id="participant-id"
              placeholder={t('enterId')}
              value={newParticipantId}
              onChange={(e) => setNewParticipantId(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purchase-amount">{t('purchaseAmount')}</Label>
            <Input
              id="purchase-amount"
              type="number"
              placeholder={t('enterAmount')}
              value={newParticipantPurchaseAmount}
              onChange={(e) => setNewParticipantPurchaseAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bank-account"
              checked={newParticipantBankAccount}
              onCheckedChange={(checked) => setNewParticipantBankAccount(!!checked)}
            />
            <Label htmlFor="bank-account">{t('hasBankAccount')}</Label>
          </div>
          <Button onClick={addParticipant}>{t('addParticipant')}</Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>{t('currentParticipants')}</CardTitle>
          <CardDescription>{t('participantsAdded')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('id')}</TableHead>
                <TableHead>{t('bankAccount')}</TableHead>
                <TableHead>{t('purchaseAmount')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.id}</TableCell>
                  <TableCell>{participant.has_bank_account ? t('yes') : t('no')}</TableCell>
                  <TableCell>{participant.purchase_amount}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteParticipant(participant.id)}>
                      {t('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-4">
        <Button onClick={calculatePayments}>
          {t('calculatePayments')}
        </Button>

        <Dialog open={openHistory} onOpenChange={setOpenHistory}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              {t('reviewHistory')}
            </Button>
          </DialogTrigger>
          <CalculationHistory history={calculationHistory} onClose={() => setOpenHistory(false)} onDelete={handleDeleteHistoryItem} />
        </Dialog>
      </div>


      {error && (
        <Alert variant="destructive" className="mt-4 w-full max-w-md">
          <Icons.close className="h-4 w-4" />
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {calculationResults.length > 0 && (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('calculationResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {calculationResults.map((participant) => (
                <li key={participant.id} className="mb-2">
                  <strong>{t('participant')} {participant.id}:</strong>
                  {participant.has_bank_account ? (
                    <>
                      <p>{t('grossPayment')}: {participant.gross_bank_payment?.toFixed(2)}</p>
                      <p>{t('cashReceived')}: {participant.cash_received?.toFixed(2)}</p>
                      <p className="text-accent">{t('netPayment')}: {participant.net_bank_payment?.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-accent">{t('cashContributed')}: {participant.cash_contributed?.toFixed(2)}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

