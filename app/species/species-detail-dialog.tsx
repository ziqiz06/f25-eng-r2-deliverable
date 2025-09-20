"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import EditSpeciesDialog from "./edit-species-dialog";
import DeleteSpeciesDialog from "./delete-species-dialogue"

import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDetailDialog({ species }: { species: Species }) {
  //copied from add-sepcies
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Species Information</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Species Information: {species.scientific_name}</DialogTitle>
        </DialogHeader>
        <EditSpeciesDialog species={species} />
        <div className="flex justify-center">
          {species.image && (
            <div className="relative h-40 w-60">
              <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
            </div>
          )}
        </div>
        {/* used ?? instead of || bc it will return values like null or undefined*/}
        <p>
          <strong>Common Name:</strong> {species?.common_name ?? "?"}
        </p>
        <p>
          <strong>Total Population:</strong> {species.total_population ?? "?"}
        </p>
        <p>
          <strong>Kingdom:</strong> {species.kingdom}
        </p>
        <p>
          <strong>Description:</strong> {species.description ?? "?"}
        </p>
        <div className="flex justify-center mt-4">
          <DeleteSpeciesDialog species={species} />
        </div>
      </DialogContent>

    </Dialog>
  );
}
