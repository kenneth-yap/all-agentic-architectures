import { notFound } from "next/navigation";
import { getArchitecture, architectures } from "@/lib/architectures";
import ArchitectureClient from "./ArchitectureClient";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return architectures.map((a) => ({ id: a.id }));
}

export default function ArchitecturePage({ params }: Props) {
  const arch = getArchitecture(params.id);
  if (!arch) return notFound();
  return <ArchitectureClient arch={arch} />;
}
