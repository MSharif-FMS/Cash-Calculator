'use client';

import React, { useState, useEffect } from 'react';
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
import { i18n } from '../i18n/i18n-config';
import { Locale } from '../i18n/i18n-config';
import { getDictionary } from '../i18n/dictionaries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react'; // Import Moon and Sun icons
import { useTheme } from 'next-themes'; // Import useTheme hook


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

const CalculationHistory = ({ dictionary, history, onClose, onDelete }: { dictionary: any, history: CalculationResult[]; onClose: () => void; onDelete: (id: string) => void }) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{dictionary["Calculation History"]}</DialogTitle>
        <DialogDescription>{dictionary["Review previous calculations."]}</DialogDescription>
      </DialogHeader>
      {history.length === 0 ? (
        <p>{dictionary["No calculation history available."]}</p>
      ) : (
        <ScrollArea className="h-[400px] w-full">
          <div className="grid gap-4">
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{dictionary["Calculation"]} {history.findIndex(h => h.id === item.id) + 1}</CardTitle>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                      {dictionary["Delete"]}
                    </Button>
                  </div>
                  <CardDescription>{dictionary["Timestamp"]}: {item.timestamp}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{dictionary["Participants:"]}</p>
                  <ul>
                    {item.participants.map((p) => (
                      <li key={p.id}>
                        {p.id} - ${p.purchase_amount} - {dictionary["Bank Account"]}: {p.has_bank_account ? dictionary["Yes"] : dictionary["No"]}
                      </li>
                    ))}
                  </ul>
                  <p>{dictionary["Results:"]}</p>
                  <ul>
                    {item.results.map((r) => (
                      <li key={r.id}>
                        {r.id}: {dictionary["Net Payment"]}: {r.net_bank_payment?.toFixed(2) || r.cash_contributed?.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      <Button onClick={onClose}>{dictionary["Close"]}</Button>
    </DialogContent>
  );
};


export default function Home({ params: { locale } }: { params: { locale: Locale } }) {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', has_bank_account: true, purchase_amount: 20 },
    { id: '2', has_bank_account: false, purchase_amount: 30 },
    { id: '3', has_bank_account: true, purchase_amount: 50 },
  ]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newParticipantBankAccount, setNewParticipantBankAccount] = useState(false);
  const [newParticipantPurchaseAmount, setNewParticipantPurchaseAmount] = useState<number | ''>('');
  const [calculationResults, setCalculationResults] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [calculationHistory, setCalculationHistory] = useState<CalculationResult[]>([]);
  const [openHistory, setOpenHistory] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // Use next-themes hook

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
      setError(dictionary["Error"] + ': ' + dictionary["Cannot distribute cash. No bank participants."]);
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
      alert(dictionary["Please fill in all fields."]);
      return;
    }

    const newAmount = Number(newParticipantPurchaseAmount);
    if (isNaN(newAmount)) {
      alert(dictionary["Please enter a valid purchase amount."]);
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

  const dictionary = await getDictionary(locale);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary p-8">
      <div className="flex justify-between w-full max-w-md mb-4">
        <Select value={locale} onValueChange={(value) => router.push(`/${value}`)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={dictionary["Select Language"]} />
          </SelectTrigger>
          <SelectContent>
            {i18n.locales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                {locale}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Theme Toggle Button */}
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary["SettleSmart"]}</CardTitle>
          <CardDescription>{dictionary["Enter participants and purchase amounts to calculate payments."]}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="participant-id">{dictionary["Participant ID"]}</Label>
            <Input
              id="participant-id"
              placeholder={dictionary["Enter ID"]}
              value={newParticipantId}
              onChange={(e) => setNewParticipantId(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purchase-amount">{dictionary["Purchase Amount"]}</Label>
            <Input
              id="purchase-amount"
              type="number"
              placeholder={dictionary["Enter amount"]}
              value={newParticipantPurchaseAmount}
              onChange={(e) => setNewParticipantPurchaseAmount(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bank-account"
              checked={newParticipantBankAccount}
              onCheckedChange={(checked) => setNewParticipantBankAccount(!!checked)}
            />
            <Label htmlFor="bank-account">{dictionary["Has Bank Account"]}</Label>
          </div>
          <Button onClick={addParticipant}>{dictionary["Add Participant"]}</Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>{dictionary["Current Participants"]}</CardTitle>
          <CardDescription>{dictionary["List of participants added"]}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dictionary["ID"]}</TableHead>
                <TableHead>{dictionary["Bank Account"]}</TableHead>
                <TableHead>{dictionary["Purchase Amount"]}</TableHead>
                <TableHead>{dictionary["Actions"]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.id}</TableCell>
                  <TableCell>{participant.has_bank_account ? dictionary["Yes"] : dictionary["No"]}</TableCell>
                  <TableCell>{participant.purchase_amount}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteParticipant(participant.id)}>
                      {dictionary["Delete"]}
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
          {dictionary["Calculate Payments"]}
        </Button>

        <Dialog open={openHistory} onOpenChange={setOpenHistory}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              {dictionary["Review Calculation History"]}
            </Button>
          </DialogTrigger>
          <CalculationHistory dictionary={dictionary} history={calculationHistory} onClose={() => setOpenHistory(false)} onDelete={handleDeleteHistoryItem} />
        </Dialog>
      </div>


      {error && (
        <Alert variant="destructive" className="mt-4 w-full max-w-md">
          <Icons.close className="h-4 w-4" />
          <AlertTitle>{dictionary["Error"]}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {calculationResults.length > 0 && (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle>{dictionary["Calculation Results"]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {calculationResults.map((participant) => (
                <li key={participant.id} className="mb-2">
                  <strong>{dictionary["Participant"]} {participant.id}:</strong>
                  {participant.has_bank_account ? (
                    <>
                      <p>{dictionary["Gross Payment"]}: {participant.gross_bank_payment?.toFixed(2)}</p>
                      <p>{dictionary["Cash Received"]}: {participant.cash_received?.toFixed(2)}</p>
                      <p className="text-accent">{dictionary["Net Payment"]}: {participant.net_bank_payment?.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-accent">{dictionary["Cash Contributed"]}: {participant.cash_contributed?.toFixed(2)}</p>
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


