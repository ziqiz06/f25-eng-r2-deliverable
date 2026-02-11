"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";

import DeleteSpeciesDialog from "./delete-species-dialogue";
import EditSpeciesDialog from "./edit-species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDetailDialog({ species, sessionId }: { species: Species; sessionId: string }) {
  const [open, setOpen] = useState<boolean>(false);

  const isAuthor = species.author === sessionId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Species Information</Button>
      </DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Species Information: {species.scientific_name}</DialogTitle>
        </DialogHeader>

        {isAuthor && <EditSpeciesDialog species={species} />}

        <div className="flex justify-center">
          <div className="relative h-48 w-80 overflow-hidden rounded">
            <Image
              src={species.image ?? "/noimg.jpg"}
              alt={species.scientific_name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {species.common_name && (
          <p>
            <strong>Common Name:</strong> {species.common_name}
          </p>
        )}

        {species.total_population !== null && (
          <p>
            <strong>Total Population:</strong> {species.total_population}
          </p>
        )}

        <p>
          <strong>Kingdom:</strong> {species.kingdom}
        </p>

        {species.description && (
          <p>
            <strong>Description:</strong> {species.description}
          </p>
        )}

        {isAuthor && (
          <div className="mt-4 flex justify-center">
            <DeleteSpeciesDialog species={species} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
