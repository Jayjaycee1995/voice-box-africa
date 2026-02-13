import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ExternalLink } from "lucide-react";

const transactions = [
  { id: "INV-001", date: "2024-12-01", description: "Payment for MTN Commercial", amount: "$150.00", status: "Paid" },
  { id: "INV-002", date: "2024-11-20", description: "Escrow Deposit: E-learning Series", amount: "$300.00", status: "Escrow" },
  { id: "INV-003", date: "2024-11-15", description: "Refund: Cancelled Gig", amount: "-$50.00", status: "Refunded" },
];

const PaymentsView = ({ role }: { role: 'client' | 'talent' }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">{role === 'client' ? 'Payments & Invoices' : 'Earnings & Withdrawals'}</h2>
          <p className="text-muted-foreground">Track your financial history.</p>
        </div>
        {role === 'talent' && (
          <Button className="btn-gradient">Request Withdrawal</Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-muted-foreground">Total {role === 'client' ? 'Spent' : 'Earned'}</p>
             <h3 className="text-2xl font-bold mt-2">$2,450.00</h3>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-muted-foreground">Pending / Escrow</p>
             <h3 className="text-2xl font-bold mt-2">$300.00</h3>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
             <h3 className="text-2xl font-bold mt-2">$150.00</h3>
           </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">{tx.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'Paid' ? 'default' : 'secondary'}>{tx.status}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount.startsWith('-') ? 'text-destructive' : ''}`}>
                    {tx.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsView;
