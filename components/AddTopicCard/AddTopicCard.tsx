"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TopicCreatorModal from "@components/TopicCreatorModal/TopicCreatorModal";

export default function AddTopicCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
        className="rounded bg-transparent border-2 border-dashed border-bg-600 hover:border-text-muted p-6 flex items-center justify-center cursor-pointer transition-colors min-h-[100px] group focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-accent-blue focus-visible:outline-offset-2"
      >
        <Plus
          size={32}
          className="text-text-muted group-hover:text-text transition-colors"
        />
      </div>
      <TopicCreatorModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
