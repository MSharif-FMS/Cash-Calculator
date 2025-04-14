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
}

const CalculationHistory = ({ history, onClose }: { history: CalculationResult[]; onClose: () => void }) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Calculation History</DialogTitle>
        <DialogDescription>Review previous calculations.</DialogDescription>
      </DialogHeader>
      {history.length === 0 ? (
        <p>No calculation history available.</p>
      ) : (
        <div className="grid gap-4">
          {history.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Calculation {index + 1}</CardTitle>
                <CardDescription>Timestamp: {item.timestamp}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Participants:</p>
                <ul>
                  {item.participants.map((p) => (
                    <li key={p.id}>
                      {p.id} - ${p.purchase_amount} - Bank: {p.has_bank_account ? 'Yes' : 'No'}
                    </li>
                  ))}
                </ul>
                <p>Results:</p>
                <ul>
                  {item.results.map((r) => (
                    <li key={r.id}>
                      {r.id}: Net Payment: {r.net_bank_payment?.toFixed(2) || r.cash_contributed?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Button onClick={onClose}>Close</Button>
    </DialogContent>
  );
};


export default function Home() {
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
      setError('Error: Cannot distribute cash. No bank participants.');
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
      participants: [...participants],
      results: results,
      timestamp: new Date().toLocaleString(),
    };

    setCalculationHistory(prevHistory => [...prevHistory, newCalculation]);
  };

  const addParticipant = () => {
    if (!newParticipantId || newParticipantPurchaseAmount === '') {
      alert('Please fill in all fields.');
      return;
    }

    const newAmount = Number(newParticipantPurchaseAmount);
    if (isNaN(newAmount)) {
      alert('Please enter a valid purchase amount.');
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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>SettleSmart</CardTitle>
          <CardDescription>Enter participants and purchase amounts to calculate payments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="participant-id">Participant ID</Label>
            <Input
              id="participant-id"
              placeholder="Enter ID"
              value={newParticipantId}
              onChange={(e) => setNewParticipantId(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purchase-amount">Purchase Amount</Label>
            <Input
              id="purchase-amount"
              type="number"
              placeholder="Enter amount"
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
            <Label htmlFor="bank-account">Has Bank Account</Label>
          </div>
          <Button onClick={addParticipant}>Add Participant</Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>Current Participants</CardTitle>
          <CardDescription>List of participants added</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Purchase Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.id}</TableCell>
                  <TableCell>{participant.has_bank_account ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{participant.purchase_amount}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteParticipant(participant.id)}>
                      Delete
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
          Calculate Payments
        </Button>

        <Dialog open={openHistory} onOpenChange={setOpenHistory}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              Review Calculation History
            </Button>
          </DialogTrigger>
          <CalculationHistory history={calculationHistory} onClose={() => setOpenHistory(false)} />
        </Dialog>
      </div>


      {error && (
        <Alert variant="destructive" className="mt-4 w-full max-w-md">
          <Icons.close className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {calculationResults.length > 0 && (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {calculationResults.map((participant) => (
                <li key={participant.id} className="mb-2">
                  <strong>Participant {participant.id}:</strong>
                  {participant.has_bank_account ? (
                    <>
                      <p>Gross Payment: {participant.gross_bank_payment?.toFixed(2)}</p>
                      <p>Cash Received: {participant.cash_received?.toFixed(2)}</p>
                      <p className="text-accent">Net Payment: {participant.net_bank_payment?.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-accent">Cash Contributed: {participant.cash_contributed?.toFixed(2)}</p>
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
