import { useState } from "react";
import { ApplicationStatus } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // ✅ you used this but hadn’t imported it
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  X,
  Calendar,
  User,
  Download,
  RotateCcw,
  Search, // ✅ you render <Search /> but hadn’t imported it
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface AdvancedFilters {
  search: string;
  statuses: ApplicationStatus[];
  dateFrom: string;
  dateTo: string;
  agent: string;
  city: string;
  minAmount?: number;
  maxAmount?: number;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onExport: () => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
  resultCount?: number;
  isExporting?: boolean;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "SUBMITTED", label: "Submitted", color: "bg-blue-100 text-blue-800" },
  { value: "DISCREPANCY", label: "Discrepancy", color: "bg-orange-100 text-orange-800" },
  { value: "APPROVED", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
];

const agentOptions = [
  "All Agents",
  "Priya Sharma",
  "Rohit Verma",
  "Neha Singh",
  "Vikash Kumar",
  "Anjali Joshi",
];

const cityOptions = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Pune",
  "Hyderabad",
  "Kolkata",
];

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onExport,
  onReset,
  isOpen,
  onToggle,
  resultCount,
  isExporting = false,
}: AdvancedFiltersProps) {
  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleStatus = (status: ApplicationStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    updateFilter("statuses", newStatuses);
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    !!filters.agent ||
    !!filters.city;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by business name, contact, phone, PAN..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onToggle} className="gap-2 h-10">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {
                      [
                        filters.statuses.length && `${filters.statuses.length} status`,
                        filters.dateFrom && "date",
                        filters.agent && "agent",
                        filters.city && "city",
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={onReset} className="gap-2 h-10">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isExporting}
                className="gap-2 h-10"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>

          {/* Results Count */}
          {resultCount !== undefined && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">{resultCount} results found</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>Refine your search with additional criteria</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Filters */}
            <div className="space-y-3">
              <Label>Application Status</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={status.value}
                      checked={filters.statuses.includes(status.value)}
                      onCheckedChange={() => toggleStatus(status.value)}
                    />
                    <label
                      htmlFor={status.value}
                      className={cn("text-xs px-2 py-1 rounded-full cursor-pointer", status.color)}
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  From Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  To Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Agent and City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Agent
                </Label>
                <Select
                  value={filters.agent || "All Agents"}
                  onValueChange={(value) => updateFilter("agent", value === "All Agents" ? "" : value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentOptions.map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Select
                  value={filters.city || "All Cities"}
                  onValueChange={(value) => updateFilter("city", value === "All Cities" ? "" : value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(hasActiveFilters || filters.search) && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Active Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Search: "{filters.search}"
                      <button onClick={() => updateFilter("search", "")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.statuses.map((status) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {statusOptions.find((s) => s.value === status)?.label}
                      <button onClick={() => toggleStatus(status)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {filters.dateFrom && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      From: {format(new Date(filters.dateFrom), "MMM dd, yyyy")}
                      <button onClick={() => updateFilter("dateFrom", "")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      To: {format(new Date(filters.dateTo), "MMM dd, yyyy")}
                      <button onClick={() => updateFilter("dateTo", "")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.agent && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Agent: {filters.agent}
                      <button onClick={() => updateFilter("agent", "")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.city && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      City: {filters.city}
                      <button onClick={() => updateFilter("city", "")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
