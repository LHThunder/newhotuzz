import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createContact } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { ContactCard } from "@/components/collections/contact-card";

export const metadata = { title: "Contacts — LIFE OS" };

export default async function ContactsPage() {
  const user = await ensureUser();
  const contacts = user
    ? await prisma.contact.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-sm text-muted-foreground">Danh bạ mối quan hệ.</p>
      </div>

      <InlineAdd action={createContact} placeholder="Tên người liên hệ…" />

      {contacts.length === 0 ? (
        <EmptyState icon={Users} title="Chưa có liên hệ" description="Thêm người đầu tiên ở trên." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <ContactCard key={c.id} contact={{ id: c.id, name: c.name, relationship: c.relationship, company: c.company, role: c.role, contact: c.contact, notes: c.notes }} />
          ))}
        </div>
      )}
    </div>
  );
}
