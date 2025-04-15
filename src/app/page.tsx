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
  
  // Calculate summary statistics across all history records
  const historySummary = React.useMemo(() => {
    if (history.length === 0) return null;
    
    // Initialize summary data
    const summary = {
      totalCalculations: history.length,
      totalPurchaseAmount: 0,
      totalParticipants: new Set(),
      bankAccountsUsed: 0,
      cashOnlyUsed: 0,
      averagePurchasePerCalculation: 0,
      totalNetBankPayments: 0,
      totalCashContributed: 0,
    };
    
    // Accumulate data from all history records
    history.forEach(item => {
      // Add purchase amounts
      const calculationTotal = item.participants.reduce((sum, p) => sum + p.purchase_amount, 0);
      summary.totalPurchaseAmount += calculationTotal;
      
      // Count unique participants
      item.participants.forEach(p => summary.totalParticipants.add(p.id));
      
      // Count bank vs cash calculations
      const hasBankAccount = item.participants.some(p => p.has_bank_account);
      if (hasBankAccount) {
        summary.bankAccountsUsed++;
      } else {
        summary.cashOnlyUsed++;
      }
      
      // Add up all net bank payments and cash contributions
      item.results.forEach(r => {
        if (r.net_bank_payment) {
          summary.totalNetBankPayments += r.net_bank_payment;
        }
        if (r.cash_contributed) {
          summary.totalCashContributed += r.cash_contributed;
        }
      });
    });
    
    // Calculate averages
    summary.averagePurchasePerCalculation = summary.totalPurchaseAmount / summary.totalCalculations;
    
    return summary;
  }, [history]);
  
  return (
    <DialogContent className="max-w-5xl">
      <DialogHeader>
        <DialogTitle className="text-2xl">{t('reviewHistory')}</DialogTitle>
        <DialogDescription>{t('reviewPreviousCalculations')}</DialogDescription>
      </DialogHeader>
      
      {history.length === 0 ? (
        <p>{t('noCalculationHistory')}</p>
      ) : (
        <>
          {/* Overall Summary Card */}
          <Card className="mb-6 bg-primary/10 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Icons.history className="h-5 w-5" />
                {t('overallSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('totalCalculations')}</p>
                  <p className="text-2xl font-bold">{historySummary?.totalCalculations}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('totalPurchaseAmount')}</p>
                  <p className="text-2xl font-bold">{historySummary?.totalPurchaseAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('uniqueParticipants')}</p>
                  <p className="text-2xl font-bold">{historySummary?.totalParticipants.size}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('averagePurchasePerCalculation')}</p>
                  <p className="text-2xl font-bold">{historySummary?.averagePurchasePerCalculation.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('totalNetBankPayments')}</p>
                  <p className="text-2xl font-bold">{historySummary?.totalNetBankPayments.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('totalCashContributed')}</p>
                  <p className="text-2xl font-bold">{historySummary?.totalCashContributed.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('bankAccountsUsed')}</p>
                  <p className="text-2xl font-bold">{historySummary?.bankAccountsUsed}</p>
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('cashOnlyUsed')}</p>
                  <p className="text-2xl font-bold">{historySummary?.cashOnlyUsed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Individual History Records */}
          <ScrollArea className="h-[400px] w-full">
            <div className="grid gap-6">
              {history.map((item) => {
                const calculationTotal = item.participants.reduce((sum, p) => sum + p.purchase_amount, 0);
                return (
                  <Card key={item.id} className="border-l-4 border-primary">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {history.findIndex(h => h.id === item.id) + 1}
                          </span>
                          {t('calculation')}
                        </CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                          {t('delete')}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <CardDescription className="flex items-center gap-1">
                          <Icons.calendar className="h-4 w-4" />
                          {item.timestamp}
                        </CardDescription>
                        <CardDescription className="flex items-center gap-1">
                          <Icons.dollarSign className="h-4 w-4" />
                          {t('totalPurchaseAmount')}: {calculationTotal.toFixed(2)}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Icons.users className="h-4 w-4" />
                            {t('participants')}
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>{t('id')}</TableHead>
                                <TableHead>{t('bankAccount')}</TableHead>
                                <TableHead>{t('purchaseAmount')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {item.participants.map((p, index) => (
                                <TableRow key={p.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{p.id}</TableCell>
                                  <TableCell>{p.has_bank_account ? t('yes') : t('no')}</TableCell>
                                  <TableCell>{p.purchase_amount.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="font-bold bg-muted/50">
                                <TableCell colSpan={3}>{t('total')}</TableCell>
                                <TableCell>{calculationTotal.toFixed(2)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Icons.calculator className="h-4 w-4" />
                            {t('calculationResults')}
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('participant')}</TableHead>
                                <TableHead>{t('bankAccount')}</TableHead>
                                {item.results.some(r => r.gross_bank_payment) && (
                                  <TableHead>{t('grossPayment')}</TableHead>
                                )}
                                {item.results.some(r => r.cash_received) && (
                                  <TableHead>{t('cashReceived')}</TableHead>
                                )}
                                {item.results.some(r => r.net_bank_payment) && (
                                  <TableHead>{t('netPayment')}</TableHead>
                                )}
                                {item.results.some(r => r.cash_contributed) && (
                                  <TableHead>{t('cashContributed')}</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {item.results.map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell>{r.id}</TableCell>
                                  <TableCell>{r.has_bank_account ? t('yes') : t('no')}</TableCell>
                                  {item.results.some(r => r.gross_bank_payment) && (
                                    <TableCell>{r.gross_bank_payment?.toFixed(2) || '-'}</TableCell>
                                  )}
                                  {item.results.some(r => r.cash_received) && (
                                    <TableCell>{r.cash_received?.toFixed(2) || '-'}</TableCell>
                                  )}
                                  {item.results.some(r => r.net_bank_payment) && (
                                    <TableCell>{r.net_bank_payment?.toFixed(2) || '-'}</TableCell>
                                  )}
                                  {item.results.some(r => r.cash_contributed) && (
                                    <TableCell>{r.cash_contributed?.toFixed(2) || '-'}</TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}
      <Button onClick={onClose} className="mt-4">{t('close')}</Button>
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
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* Add Participant Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('addParticipant')}</CardTitle>
            <CardDescription>{t('enterParticipantDetails')}</CardDescription>
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

        {/* Participants List Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('currentParticipants')}</CardTitle>
            <CardDescription>{t('participantsAdded')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('id')}</TableHead>
                  <TableHead>{t('bankAccount')}</TableHead>
                  <TableHead>{t('purchaseAmount')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={participant.id}>
                    <TableCell>{index + 1}</TableCell>
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
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={2}>{t('total')}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{participants.reduce((sum, p) => sum + p.purchase_amount, 0)}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={calculatePayments} className="px-8">
          {t('calculatePayments')}
        </Button>

        <Dialog open={openHistory} onOpenChange={setOpenHistory}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="px-8">
              {t('reviewHistory')}
            </Button>
          </DialogTrigger>
          <CalculationHistory history={calculationHistory} onClose={() => setOpenHistory(false)} onDelete={handleDeleteHistoryItem} />
        </Dialog>
      </div>


      {error && (
        <Alert variant="destructive" className="mt-4 w-full max-w-4xl">
          <Icons.close className="h-4 w-4" />
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {calculationResults.length > 0 && (
        <Card className="mt-4 w-full max-w-4xl">
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

