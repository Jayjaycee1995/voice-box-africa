import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

type PaymentRow = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
};

const PaymentsView = ({ role }: { role: 'client' | 'talent' }) => {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, pending: 0, available: 0 });

  useEffect(() => {
    let isMounted = true;

    const fetchAsync = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        if (role === "client") {
          const { data, error } = await supabase
            .from("gigs")
            .select("id, title, budget, status, created_at")
            .eq("client_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

          if (error) throw error;

          const gigs = (data ?? []) as Array<{
            id: number;
            title: string;
            budget: number;
            status: "open" | "assigned" | "completed" | "cancelled";
            created_at: string;
          }>;

          const totalSpent = gigs
            .filter((g) => g.status === "completed")
            .reduce((acc, g) => acc + (g.budget || 0), 0);
          const pending = gigs
            .filter((g) => g.status === "assigned")
            .reduce((acc, g) => acc + (g.budget || 0), 0);

          const mapped: PaymentRow[] = gigs.map((g) => ({
            id: `GIG-${g.id}`,
            date: new Date(g.created_at).toLocaleDateString(),
            description: g.title,
            amount: `$${(g.budget || 0).toFixed(2)}`,
            status: g.status,
          }));

          if (!isMounted) return;
          setRows(mapped);
          setTotals({ total: totalSpent, pending, available: 0 });
        } else {
          const { data, error } = await supabase
            .from("proposals")
            .select("id, bid_amount, status, created_at, gig:gigs(title)")
            .eq("talent_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

          if (error) throw error;

          const proposals = (data ?? []) as unknown as Array<{
            id: number;
            bid_amount: number;
            status: "pending" | "accepted" | "rejected";
            created_at: string;
            gig?: { title: string } | null;
          }>;

          const totalEarned = proposals
            .filter((p) => p.status === "accepted")
            .reduce((acc, p) => acc + (p.bid_amount || 0), 0);
          const pending = proposals
            .filter((p) => p.status === "pending")
            .reduce((acc, p) => acc + (p.bid_amount || 0), 0);

          const mapped: PaymentRow[] = proposals.map((p) => ({
            id: `PROP-${p.id}`,
            date: new Date(p.created_at).toLocaleDateString(),
            description: p.gig?.title || "Proposal",
            amount: `$${(p.bid_amount || 0).toFixed(2)}`,
            status: p.status,
          }));

          if (!isMounted) return;
          setRows(mapped);
          setTotals({ total: totalEarned, pending, available: totalEarned });
        }
      } catch (e) {
        if (!isMounted) return;
        setRows([]);
        setTotals({ total: 0, pending: 0, available: 0 });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAsync();

    return () => {
      isMounted = false;
    };
  }, [role, user]);

  const header = useMemo(() => {
    if (role === "client") return { title: "Payments & Invoices", subtitle: "Track your project spending." };
    return { title: "Earnings", subtitle: "Track your proposal outcomes." };
  }, [role]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">{header.title}</h2>
          <p className="text-muted-foreground">{header.subtitle}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-muted-foreground">Total {role === 'client' ? 'Spent' : 'Earned'}</p>
             <h3 className="text-2xl font-bold mt-2">${totals.total.toFixed(2)}</h3>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-muted-foreground">Pending</p>
             <h3 className="text-2xl font-bold mt-2">${totals.pending.toFixed(2)}</h3>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
             <h3 className="text-2xl font-bold mt-2">${totals.available.toFixed(2)}</h3>
           </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No transactions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">{tx.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-xs text-muted-foreground">{tx.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.status === 'accepted' || tx.status === 'completed' ? 'default' : 'secondary'} className="capitalize whitespace-nowrap">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">{tx.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsView;
