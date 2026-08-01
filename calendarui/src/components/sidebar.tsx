import { useState } from 'react';

type EventForm = {
    title: string;
    date: string;
    start: string;
    end: string;
    description: string;
};

type SidebarProps = {
    isOpen: boolean;
    editingEvent: any;
    form: EventForm;
    setForm: (form: EventForm) => void;
    onSave: () => void;
    onDelete: () => void;
    onDuplicate: (targetDate: string) => void;   // CHANGED: now takes a date
    onClose: () => void;
};

export default function Sidebar({
    isOpen,
    editingEvent,
    form,
    setForm,
    onSave,
    onDelete,
    onDuplicate,
    onClose,
}: SidebarProps) {
    const [duplicating, setDuplicating] = useState(false);
    const [duplicateDate, setDuplicateDate] = useState(form.date);

    if (!isOpen) return null;

    function startDuplicate() {
        setDuplicateDate(form.date); // default to the event's own date
        setDuplicating(true);
    }

    function confirmDuplicate() {
        onDuplicate(duplicateDate);
        setDuplicating(false);
    }

    return (
        <div style={{
            position: 'fixed',
            top: '60px',
            right: 0,
            height: 'calc(100vh - 60px)',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderLeft: '0.5px solid #ccc',
            boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
        }}>
            {/* Scrollable content area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                <h3 style={{ margin: 0, fontSize: '14px' }}>
                    {editingEvent ? 'Edit event' : `New event — ${form.date}`}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Title</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="Add title"
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px' }}>Start</label>
                        <input
                            type="time"
                            value={form.start}
                            onChange={e => setForm({ ...form, start: e.target.value })}
                        />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px' }}>End</label>
                        <input
                            type="time"
                            value={form.end}
                            onChange={e => setForm({ ...form, end: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Add description"
                        style={{ height: '80px', resize: 'none' }}
                    />
                </div>

                {duplicating && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: '10px',
                        background: '#f7f7f7',
                        borderRadius: '6px',
                    }}>
                        <label style={{ fontSize: '12px' }}>Duplicate to date</label>
                        <input
                            type="date"
                            value={duplicateDate}
                            onChange={e => setDuplicateDate(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <button onClick={confirmDuplicate}>Confirm</button>
                            <button onClick={() => setDuplicating(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Buttons pinned to bottom */}
            <div style={{
                padding: '1rem 1.25rem',
                borderTop: '0.5px solid #ccc',
                display: 'flex',
                gap: '8px',
            }}>
                {editingEvent && (
                    <>
                        <button onClick={onDelete} style={{ color: 'red' }}>
                            Delete
                        </button>
                        <button onClick={startDuplicate}>
                            Duplicate
                        </button>
                    </>
                )}
                <button onClick={onClose}>Cancel</button>
                <button onClick={onSave}>Save</button>
            </div>
        </div>
    );
}