"use client"

import { BrandList } from "./components/BrandList"
import { Section } from "@/components/atoms/section"

export default function BrandsPage() {
  return <Section heading="Brand Kits" subHeading="Manage your brand identities"><BrandList /></Section>
}