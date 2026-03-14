"use client";

import { Input, Select, SelectItem, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Org {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  organizationId: string;
}

interface User {
  id: string;
  name: string;
}

interface DealFormProps {
  deal?: {
    id: string;
    name: string;
    amount: string | number;
    stage: string;
    closeDate: string | null;
    organizationId: string;
    contactId: string;
    ownerId: string;
  };
}

function ContactSelect({ organizationId, contacts, value, onChange }: {
  organizationId: string;
  contacts: Contact[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = contacts.find((c) => c.id === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = `Contact${organizationId ? ` (${contacts.length} available)` : ""}`;
  const isFloating = !!value || open;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-14 rounded-xl border-2 bg-transparent px-3 text-left text-sm outline-none transition-colors flex items-center justify-between
          ${open ? "border-primary" : "border-default-200 hover:border-default-400"}`}
      >
        <span className="pt-4 pb-1 truncate text-foreground">
          {selected ? `${selected.firstName} ${selected.lastName}` : ""}
        </span>
        <svg height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-foreground-500">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <label className={`pointer-events-none absolute left-3 transition-all duration-100 text-foreground-500 ${open ? "text-primary" : ""} ${isFloating ? "top-1.5 text-xs" : "top-1/2 -translate-y-1/2 text-sm"}`}>
        {label}<span className="ml-0.5 text-danger">*</span>
      </label>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-default-200 bg-content1 shadow-lg overflow-hidden">
          {contacts.length === 0 ? (
            <div className="px-3 py-2 text-sm text-foreground-500">No contacts available</div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-default-100
                  ${c.id === value ? "bg-default-100 text-primary font-medium" : "text-foreground"}`}
              >
                {c.firstName} {c.lastName}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const stages = [
  { value: "prospecting", label: "Prospecting" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

export default function DealForm({ deal }: DealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [name, setName] = useState(deal?.name || "");
  const [amount, setAmount] = useState(deal?.amount?.toString() || "");
  const [stage, setStage] = useState(deal?.stage || "");
  const [closeDate, setCloseDate] = useState(
    deal?.closeDate ? new Date(deal.closeDate).toISOString().split("T")[0] : ""
  );
  const [organizationId, setOrganizationId] = useState(deal?.organizationId || "");
  const [contactId, setContactId] = useState(deal?.contactId || "");
  const [ownerId, setOwnerId] = useState(deal?.ownerId || "");

  useEffect(() => {
    fetch("/api/organizations").then((r) => r.json()).then(setOrgs);
    fetch("/api/contacts").then((r) => r.json()).then(setContacts);
    fetch("/api/organizations").then((r) => r.json()).then((orgsData: Org[]) => {
      const userPromises = orgsData.map((org: Org) =>
        fetch(`/api/organizations/${org.id}`).then((r) => r.json())
      );
      Promise.all(userPromises).then((orgDetails) => {
        const allUsers = orgDetails.flatMap((o: { users?: User[] }) => o.users || []);
        const uniqueUsers = Array.from(
          new Map(allUsers.map((u: User) => [u.id, u])).values()
        );
        setUsers(uniqueUsers);
      });
    });
  }, []);

  const filteredContacts = organizationId
    ? contacts.filter((c) => c.organizationId === organizationId)
    : contacts;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      amount: parseFloat(amount),
      stage,
      closeDate: closeDate || null,
      organizationId,
      contactId,
      ownerId,
    };

    const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
    const method = deal ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    router.push("/deals");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Input
        label="Deal Name"
        variant="bordered"
        value={name}
        onValueChange={setName}
        placeholder="Enter deal name"
        isRequired
      />

      <div className="form-row">
        <Input
          label="Amount ($)"
          variant="bordered"
          type="number"
          value={amount}
          onValueChange={setAmount}
          placeholder="0"
          min={0}
          step={1}
          isRequired
        />
        <Select
          label="Stage"
          variant="bordered"
          placeholder="Select stage"
          selectedKeys={stage ? [stage] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setStage(selected || "");
          }}
          isRequired
        >
          {stages.map((s) => (
            <SelectItem key={s.value}>{s.label}</SelectItem>
          ))}
        </Select>
      </div>

      <Input
        label="Close Date"
        variant="bordered"
        type="date"
        value={closeDate}
        onValueChange={setCloseDate}
      />

      <Select
        label="Organization"
        variant="bordered"
        placeholder="Select organization"
        selectedKeys={organizationId ? [organizationId] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setOrganizationId(selected || "");
          setContactId("");
        }}
        isRequired
      >
        {orgs.map((org) => (
          <SelectItem key={org.id}>{org.name}</SelectItem>
        ))}
      </Select>

      <ContactSelect
        organizationId={organizationId}
        contacts={filteredContacts}
        value={contactId}
        onChange={setContactId}
      />

      <Select
        label="Owner"
        variant="bordered"
        placeholder="Select owner"
        selectedKeys={ownerId ? [ownerId] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setOwnerId(selected || "");
        }}
        isRequired
      >
        {users.map((u) => (
          <SelectItem key={u.id}>{u.name}</SelectItem>
        ))}
      </Select>

      <div className="form-actions">
        <Button type="submit" color="primary" isLoading={loading}>
          {deal ? "Update Deal" : "Create Deal"}
        </Button>
        <Button variant="flat" onPress={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
