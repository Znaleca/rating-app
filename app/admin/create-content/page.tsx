export default function CreateContentPage() {
    return (
        <div className="p-10 text-[var(--foreground)]">
            <div className="max-w-4xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm rounded-2xl p-8">
                <h1 className="text-3xl font-black mb-2">Create Content</h1>
                <p className="text-[var(--muted-foreground)] mb-8 font-medium">Publish a new Movie or Show review.</p>

                <div className="text-center py-20 text-[var(--muted-foreground)] font-bold border border-[var(--border-subtle)] border-dashed rounded-xl bg-[var(--surface)]">
                    Content editor form will go here
                </div>
            </div>
        </div>
    );
}
