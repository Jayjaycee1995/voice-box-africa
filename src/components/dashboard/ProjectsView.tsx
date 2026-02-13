import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import api from "@/lib/axios";
import { Gig } from "@/lib/database.types";

interface Proposal {
  id: string;
  gig_id: string;
  voice_talent_id: string;
  bid_price: number;
  delivery_time: number;
  proposal_text: string;
  demo_url?: string;
  status: 'submitted' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
  gig: Gig;
  client?: {
    name: string;
  };
}

interface TalentGig extends Gig {
  proposal_status?: string;
  bid_amount?: number;
  client?: {
    name: string;
  };
}

const ProjectsView = ({ role }: { role: 'client' | 'talent' }) => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<TalentGig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        if (role === 'client') {
          const response = await api.get('/my-gigs');
          if (isMounted) setProjects(response.data);
        } else {
          // For talents, fetch gigs they've submitted proposals for
          const response = await api.get('/my-proposals');
          if (!isMounted) return;
          const proposals: Proposal[] = response.data;
          // Map proposals to gig format for the view
          const mappedGigs: TalentGig[] = proposals.map((p) => {
            // Safety check for deleted gigs
            if (!p.gig) {
              return {
                id: p.gig_id,
                title: 'Unknown Project',
                description: 'This project may have been deleted',
                budget: p.bid_price,
                deadline: new Date().toISOString(),
                status: 'closed',
                created_at: p.created_at,
                client_id: '',
                category: 'Unknown',
                proposal_status: p.status,
                bid_amount: p.bid_price,
                client: p.client
              } as TalentGig;
            }
            
            return {
              ...p.gig,
              proposal_status: p.status,
              bid_amount: p.bid_price,
              client: p.client
            };
          });
          setProjects(mappedGigs);
        }
      } catch (error) {
        if (isMounted) console.error("Failed to fetch projects", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const statusColors: Record<string, string> = {
    "in-progress": "bg-blue-100 text-blue-700",
    "review": "bg-yellow-100 text-yellow-700",
    "open": "bg-gray-100 text-gray-700",
    "completed": "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">My Projects</h2>
          <p className="text-muted-foreground">Manage your active and past gigs.</p>
        </div>
        {role === 'client' && (
          <Button className="btn-gradient gap-2" asChild>
            <Link to="/post-gig">
              <Plus className="w-4 h-4" /> Post a Project
            </Link>
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No projects found.
            </CardContent>
          </Card>
        ) : (
          projects
            .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
            .map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{project.title}</h3>
                          {role === 'talent' && project.proposal_status && (
                            <Badge variant="outline" className={statusColors[project.proposal_status] || "bg-gray-100 text-gray-700"}>
                              Proposal: {project.proposal_status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {role === 'client' ? `Status: ${project.status}` : `Client: ${project.client?.name || 'Unknown'}`}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(project.deadline).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ${project.budget}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <Badge className={statusColors[project.status] || "bg-gray-100 text-gray-700"}>
                        {project.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/gig/${project.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default ProjectsView;