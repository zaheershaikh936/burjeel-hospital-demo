"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Palette, Save, Building2, RefreshCw, Monitor, Megaphone, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useBranding, useUpdateBranding, useUploadLogo } from "@/hooks/useBranding";
import { DEFAULT_BRANDING } from "@/services/branding.service";
import type { Branding } from "@/types";

const ADMIN_PRESETS = [
  "#0ea5e9", "#0284c7", "#2563eb", "#7c3aed",
  "#dc2626", "#16a34a", "#ca8a04", "#0f766e",
];

const DISPLAY_COLOR_FIELDS: { key: keyof Branding; label: string; description: string }[] = [
  { key: "displayBgColor", label: "Background",  description: "Main screen background" },
  { key: "headerColor",    label: "Header Bar",   description: "Top control bar color" },
  { key: "roomCardColor",  label: "Room Card",    description: "Room number card background" },
  { key: "maleColor",      label: "Male",         description: "Male patient card color" },
  { key: "femaleColor",    label: "Female",       description: "Female patient card color" },
  { key: "availableColor", label: "Available",    description: "Vacant/available card color" },
];

interface ColorFieldProps {
  id: string; label: string; description: string; value: string;
  onChange: (v: string) => void;
}

function ColorField({ id, label, description, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg border border-border shadow-sm cursor-pointer shrink-0"
        style={{ backgroundColor: value }}
        onClick={() => document.getElementById(`${id}-picker`)?.click()}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs w-28 shrink-0"
        placeholder="#000000"
      />
      <input
        id={`${id}-picker`} type="color" value={value}
        onChange={(e) => onChange(e.target.value)} className="sr-only"
      />
    </div>
  );
}

export default function BrandingPage() {
  const { branding, isLoading } = useBranding();
  const updateBranding = useUpdateBranding();
  const uploadLogo = useUploadLogo();
  const fileRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState("");
  const [adminColors, setAdminColors] = useState({ primary: "", secondary: "" });
  const [displayColors, setDisplayColors] = useState<Partial<Branding>>({});
  const [bannerText, setBannerText] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState<boolean | null>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  const primary   = adminColors.primary   || branding.primaryColor;
  const secondary = adminColors.secondary || branding.secondaryColor;
  const currentBannerText    = bannerText    !== "" ? bannerText    : (branding.bannerText    ?? DEFAULT_BRANDING.bannerText);
  const currentBannerEnabled = bannerEnabled !== null ? bannerEnabled : (branding.bannerEnabled ?? true);
  const currentFontSize      = fontSize      !== null ? fontSize      : (branding.displayFontSize ?? DEFAULT_BRANDING.displayFontSize);

  function getDisplayColor(key: keyof Branding): string {
    return (displayColors[key] as string | undefined) ?? (branding[key] as string) ?? (DEFAULT_BRANDING[key] as string);
  }
  function setDisplayColor(key: keyof Branding, v: string) {
    setDisplayColors((prev) => ({ ...prev, [key]: v }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const url = await uploadLogo.mutateAsync(file);
      await updateBranding.mutateAsync({ logo: url });
      toast.success("Logo updated");
      setLogoPreview("");
    } catch {
      toast.error("Failed to upload logo");
      setLogoPreview("");
    }
  }

  async function handleSaveAdminColors() {
    try {
      await updateBranding.mutateAsync({ primaryColor: primary, secondaryColor: secondary });
      toast.success("Admin colors saved");
    } catch { toast.error("Failed to save colors"); }
  }

  async function handleSaveDisplayColors() {
    const updates: Partial<Branding> = {};
    for (const { key } of DISPLAY_COLOR_FIELDS) {
      updates[key] = getDisplayColor(key) as never;
    }
    try {
      await updateBranding.mutateAsync(updates);
      toast.success("Display colors saved");
      setDisplayColors({});
    } catch { toast.error("Failed to save display colors"); }
  }

  async function handleSaveFontSize() {
    try {
      await updateBranding.mutateAsync({ displayFontSize: currentFontSize });
      toast.success("Font size saved — all displays updated");
      setFontSize(null);
    } catch { toast.error("Failed to save font size"); }
  }

  async function handleSaveBanner() {
    try {
      await updateBranding.mutateAsync({
        bannerEnabled: currentBannerEnabled,
        bannerText: currentBannerText,
      });
      toast.success("Banner settings saved — all displays updated");
      setBannerText("");
      setBannerEnabled(null);
    } catch { toast.error("Failed to save banner"); }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Logo */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" /> Hospital Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview || branding.logo ? (
                <Image src={logoPreview || branding.logo} alt="Logo" width={250} height={250} className="object-contain w-full h-full" />
              ) : (
                <Building2 className="w-10 h-10 text-muted-foreground/40" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Upload Hospital Logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or SVG. Recommended 200×200px.</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending}>
                {uploadLogo.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadLogo.isPending ? "Uploading..." : "Choose File"}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin colors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" /> Admin Panel Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { id: "primary", label: "Primary Color", value: primary, onChange: (v: string) => setAdminColors((p) => ({ ...p, primary: v })) },
              { id: "secondary", label: "Secondary Color", value: secondary, onChange: (v: string) => setAdminColors((p) => ({ ...p, secondary: v })) },
            ].map(({ id, label, value, onChange }) => (
              <div key={id} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer shrink-0" style={{ backgroundColor: value }} onClick={() => document.getElementById(`${id}Picker`)?.click()} />
                  <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm" />
                  <input id={`${id}Picker`} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick presets</p>
            <div className="flex flex-wrap gap-2">
              {ADMIN_PRESETS.map((color) => (
                <button key={color} className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: color }} onClick={() => setAdminColors((p) => ({ ...p, primary: color }))} title={color} />
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveAdminColors} disabled={updateBranding.isPending} className="gap-2">
              {updateBranding.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Colors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display colors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" /> Room Display Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {DISPLAY_COLOR_FIELDS.map(({ key, label, description }) => (
              <ColorField key={key} id={key} label={label} description={description} value={getDisplayColor(key)} onChange={(v) => setDisplayColor(key, v)} />
            ))}
          </div>
          <Separator />
          {/* Mini preview */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="flex items-center gap-3 px-3 py-2" style={{ backgroundColor: getDisplayColor("headerColor") }}>
                <span className="text-white/80 text-[9px] uppercase tracking-widest font-semibold">Occupancy</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border-2 border-white bg-white text-gray-900">Occupied</span>
                <span className="text-white/80 text-[9px] uppercase tracking-widest font-semibold">Patient Gender</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border-2 border-white bg-white text-gray-900">Male</span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-500 text-white border-2 border-orange-400">Save &amp; Close</span>
              </div>
              <div className="flex gap-2 p-2" style={{ backgroundColor: getDisplayColor("displayBgColor") }}>
                <div className="flex-1 rounded-xl flex flex-col items-center justify-center py-5" style={{ backgroundColor: getDisplayColor("roomCardColor") }}>
                  <p className="text-white font-black text-3xl">501</p>
                  <p className="text-white/60 text-xs mt-1">Royal Room</p>
                </div>
                <div className="flex-1 rounded-xl flex flex-col items-center justify-center py-5" style={{ backgroundColor: getDisplayColor("maleColor") }}>
                  <span className="text-white font-bold text-3xl leading-none">♂</span>
                  <p className="text-white font-black text-xs mt-1">Male</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveDisplayColors} disabled={updateBranding.isPending} className="gap-2">
              {updateBranding.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Display Colors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Font Size */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" /> Display Font Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Room Number Size</Label>
              <span className="text-sm font-mono font-semibold tabular-nums w-12 text-right">{currentFontSize}px</span>
            </div>
            <input
              type="range"
              min={60}
              max={180}
              step={5}
              value={currentFontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>60px</span>
              <span>Small ← → Large</span>
              <span>180px</span>
            </div>
          </div>
          {/* Live size preview */}
          <div className="rounded-xl flex items-center justify-center py-6" style={{ backgroundColor: getDisplayColor("roomCardColor") }}>
            <p className="text-white font-black leading-none" style={{ fontSize: `${currentFontSize}px` }}>501</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveFontSize} disabled={updateBranding.isPending} className="gap-2">
              {updateBranding.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Font Size
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotional Banner */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-muted-foreground" /> Promotional Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <div>
              <p className="text-sm font-medium">Show banner on displays</p>
              <p className="text-xs text-muted-foreground">Toggle the scrolling banner on all room displays</p>
            </div>
            <Switch
              checked={currentBannerEnabled}
              onCheckedChange={(v) => setBannerEnabled(v)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerText">Banner Text</Label>
            <textarea
              id="bannerText"
              value={currentBannerText}
              onChange={(e) => setBannerText(e.target.value)}
              rows={3}
              placeholder="Enter promotional message..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Use  <code className="bg-muted px-1 rounded">·</code>  to add visual separators between messages.
            </p>
          </div>

          {/* Banner preview */}
          {currentBannerEnabled && (
            <div className="rounded-lg overflow-hidden bg-black/90 py-2.5 px-4">
              <div className="overflow-hidden whitespace-nowrap">
                <div
                  className="inline-flex gap-0 text-white/80 text-sm font-medium"
                  style={{ animation: "marquee-scroll 25s linear infinite" }}
                >
                  <span className="pr-16">{currentBannerText}</span>
                  <span className="pr-16" aria-hidden>{currentBannerText}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveBanner} disabled={updateBranding.isPending} className="gap-2">
              {updateBranding.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Banner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
