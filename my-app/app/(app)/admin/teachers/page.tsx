import { requireAdmin } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Edit, Trash2, GraduationCap, Plus } from "lucide-react";

export default async function TeachersPage() {
  const user = await requireAdmin();

  // Mock data - replace with actual data fetching
  const teachers = [
    {
      _id: "1",
      username: "dr_smith",
      email: "smith@university.edu",
      role: "teacher",
      specializations: ["Theology", "Biblical Studies"],
      joinedAt: "2024-01-10",
      isReported: false,
    },
    {
      _id: "2",
      username: "prof_johnson",
      email: "johnson@seminary.edu",
      role: "senior_teacher",
      specializations: ["Church History", "Systematic Theology"],
      joinedAt: "2024-01-05",
      isReported: false,
    },
    {
      _id: "3",
      username: "dean_williams",
      email: "williams@divinity.edu",
      role: "lead_teacher",
      specializations: ["Pastoral Care", "Ethics"],
      joinedAt: "2024-01-01",
      isReported: false,
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search teachers..." 
                  className="pl-10"
                />
              </div>
            </div>
            <select className="border rounded-md px-3 py-2">
              <option value="">All Roles</option>
              <option value="teacher">Teacher</option>
              <option value="senior_teacher">Senior Teacher</option>
              <option value="lead_teacher">Lead Teacher</option>
            </select>
            <select className="border rounded-md px-3 py-2">
              <option value="">All Specializations</option>
              <option value="theology">Theology</option>
              <option value="biblical_studies">Biblical Studies</option>
              <option value="church_history">Church History</option>
            </select>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{teacher.username}</div>
                        <div className="text-sm text-gray-500">ID: {teacher._id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      teacher.role === 'lead_teacher' ? 'default' : 
                      teacher.role === 'senior_teacher' ? 'secondary' : 'outline'
                    }>
                      {teacher.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{teacher.joinedAt}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.isReported ? 'destructive' : 'default'}>
                      {teacher.isReported ? 'Reported' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 