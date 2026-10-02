import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  Sparkles,
  Camera,
  ChevronDown,
  X,
  Crosshair,
  FileText,
  Truck,
  AlertTriangle,
  ShieldAlert,
  Hammer,
  Package,
  Droplets,
  Cpu,
  Layers,
  Map as MapIcon,
  Check,
  Bot,
  BrainCircuit,
  Wand2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import L from 'leaflet';
import { IssueCategory, IssueSeverity } from '../types/issue';
import { SAMPLE_REPORT_TEMPLATES } from '../data/seedData';
import { api } from '../services/api';

interface CategoryOption {
  label: IssueCategory;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    label: 'Overflowing Bin',
    title: 'Overflowing Public Bin',
    subtitle: 'Municipal waste receptacle at capacity or bags spilling onto sidewalk',
    icon: <Trash2 className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Illegal Dumping',
    title: 'Illegal Dumping',
    subtitle: 'Unauthorized bulk garbage, discarded furniture or industrial roadside dumping',
    icon: <Truck className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Hazardous Chemical Waste',
    title: 'Hazardous Chemical Waste',
    subtitle: 'Chemical drums, vehicle fluids, engine oil, or toxic industrial solvents',
    icon: <AlertTriangle className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Biohazard / Medical Waste',
    title: 'Biohazard / Medical Waste',
    subtitle: 'Discarded syringes, medical containers, biological matter or contaminated items',
    icon: <ShieldAlert className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Construction Debris',
    title: 'Construction Debris',
    subtitle: 'Concrete rubble, drywall, bricks, broken tiles, or rebar hazards',
    icon: <Hammer className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Plastic Accumulation',
    title: 'Plastic Accumulation',
    subtitle: 'Heavy density plastic packaging, single-use bags, or ocean-bound bottle drift',
    icon: <Package className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Blocked Drainage',
    title: 'Blocked Drainage',
    subtitle: 'Stormwater drain or culvert clogged with debris causing street flooding',
    icon: <Droplets className="w-5 h-5 text-emerald-600" />
  },
  {
    label: 'Electronic E-Waste',
    title: 'Electronic E-Waste',
    subtitle: 'Old monitors, corrosive lead-acid batteries, cables, or circuit boards',
    icon: <Cpu className="w-5 h-5 text-emerald-600" />
  }
];

type UiSeverity = 'Routine' | 'Moderate' | 'Urgent';

const SEVERITY_LEVELS: {
  key: UiSeverity;
  title: string;
  subtitle: string;
  dotColor: string;
  borderColor: string;
  activeBg: string;
}[] = [
  {
    key: 'Routine',
    title: 'Routine',
    subtitle: 'Non-Hazardous (24 - 48h)',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-600',
    activeBg: 'bg-emerald-50/50'
  },
  {
    key: 'Moderate',
    title: 'Moderate',
    subtitle: 'Pest/Pedestrian Obstruction',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-600',
    activeBg: 'bg-amber-50/50'
  },
  {
    key: 'Urgent',
    title: 'Urgent',
    subtitle: 'Broken Glass or Toxic Spill',
    dotColor: 'bg-rose-500',
    borderColor: 'border-rose-600',
    activeBg: 'bg-rose-50/50'
  }
];

const CIVIC_TAGS = [
  'Near pedestrian crosswalk',
  'Attracting stray animals',
  'Strong odor present',
  'Shattered glass hazard',
  'Blocking bike lane',
  'Spilling into stormwater drain',
  'Adjacent to school or playground',
  'Commercial packaging debris'
];

interface AiAnalysisData {
  waste_category: string;
  category_label: string;
  severity: string;
  urgency: string;
  confidence_score: number;
  detailed_description: string;
  suggested_action: string;
}

interface ReportIssueProps {
  onReportSubmitted?: (issueId: string) => void;
  onNavigateToFeed?: () => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({ onReportSubmitted, onNavigateToFeed }) => {
  // Category State
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORY_OPTIONS[0]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Severity Level State
  const [severity, setSeverity] = useState<UiSeverity>('Routine');

  // Visual Evidence Photos (Up to 5)
  const [photos, setPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Computer Vision Waste Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisData | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Description & Civic Tags
  const [description, setDescription] = useState('');

  // Location & Map State
  const [address, setAddress] = useState('14 Market Street, Sector 4');
  const [landmark, setLandmark] = useState('Near Metro Gate 2, Central Market');
  const [spotNotes, setSpotNotes] = useState('');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Reporter Notification
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIssueId, setSubmittedIssueId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Reverse Geocoding helper using backend OSM proxy
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const data = await api.reverseGeocode(lat, lng);
      if (data) {
        if (data.streetAddress) setAddress(data.streetAddress);
        if (data.areaLandmark) setLandmark(data.areaLandmark);
        setLocationSuccessMsg(`📍 Live Location Detected: ${data.streetAddress || `${lat}, ${lng}`}`);
        setTimeout(() => setLocationSuccessMsg(''), 4500);
      }
    } catch (e) {
      console.warn('Geocoding note:', e);
    }
  };

  // Initialize Real-time Interactive Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const initialMap = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Default OpenStreetMap Tiles
      const tileUrl =
        mapMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const initialLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(initialMap);
      tileLayerRef.current = initialLayer;

      // Custom Red Pin Icon
      const customPin = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 34px; height: 44px; transform: translate(-50%, -100%);">
            <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 14px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%;"></div>
            <svg width="34" height="44" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#E11D48"/>
              <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44]
      });

      const initialMarker = L.marker([coords.lat, coords.lng], {
        icon: customPin,
        draggable: true
      }).addTo(initialMap);

      // Drag marker event
      initialMarker.on('dragend', () => {
        const pos = initialMarker.getLatLng();
        const newCoords = { lat: Number(pos.lat.toFixed(5)), lng: Number(pos.lng.toFixed(5)) };
        setCoords(newCoords);
        reverseGeocode(newCoords.lat, newCoords.lng);
      });

      // Click map anywhere to pinpoint waste
      initialMap.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const newCoords = { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
        setCoords(newCoords);
        initialMarker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      leafletMapRef.current = initialMap;
      markerRef.current = initialMarker;

      // Ensure proper tile rendering after DOM paint
      setTimeout(() => {
        initialMap.invalidateSize();
      }, 250);
    }

    return () => {
      // Cleanup on unmount
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map tiles when mapMode changes (Map vs Satellite)
  useEffect(() => {
    if (!leafletMapRef.current) return;
    if (tileLayerRef.current) {
      leafletMapRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl =
      mapMode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(leafletMapRef.current);
    tileLayerRef.current = newLayer;
    leafletMapRef.current.invalidateSize();
  }, [mapMode]);

  // Real-Time GPS Detection using Browser Geolocation with Automatic IP Fallback
  const handleDetectLocation = () => {
    setIsLocating(true);
    setFormError('');
    setLocationSuccessMsg('Connecting to GPS satellite and network telemetry...');

    const applyLocation = async (lat: number, lng: number, source: 'gps' | 'ip') => {
      const fixedLat = Number(lat.toFixed(5));
      const fixedLng = Number(lng.toFixed(5));
      setCoords({ lat: fixedLat, lng: fixedLng });

      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
        leafletMapRef.current.setView([fixedLat, fixedLng], 16, { animate: true });
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([fixedLat, fixedLng]);
      }

      const geo = await api.reverseGeocode(fixedLat, fixedLng);
      if (geo) {
        if (geo.streetAddress) setAddress(geo.streetAddress);
        if (geo.areaLandmark) setLandmark(geo.areaLandmark);
        setLocationSuccessMsg(
          source === 'gps'
            ? `📍 Precise Live GPS Detected: ${geo.streetAddress}`
            : `📍 Network Location Detected: ${geo.streetAddress} (Click map to fine-tune)`
        );
      }
      setIsLocating(false);
      setTimeout(() => setLocationSuccessMsg(''), 5000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyLocation(pos.coords.latitude, pos.coords.longitude, 'gps');
        },
        async (err) => {
          console.warn('GPS prompt dismissed or unavailable, activating IP telemetry fallback:', err.message);
          try {
            const ipData = await api.getIpLocation();
            if (ipData && ipData.lat && ipData.lng) {
              await applyLocation(ipData.lat, ipData.lng, 'ip');
            } else {
              setFormError('Unable to auto-detect position. Click on the map to set your location pin.');
              setIsLocating(false);
            }
          } catch (e) {
            setFormError('Could not detect location. Please click on the map.');
            setIsLocating(false);
          }
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    } else {
      // Browser does not support geolocation
      api.getIpLocation().then((ipData) => {
        if (ipData && ipData.lat && ipData.lng) {
          applyLocation(ipData.lat, ipData.lng, 'ip');
        } else {
          setIsLocating(false);
        }
      }).catch(() => setIsLocating(false));
    }
  };

  // AI Waste Analyzer Runner
  const runAiAnalysis = async (imageSrc: string) => {
    setIsAnalyzingAi(true);
    try {
      const data: AiAnalysisData = await api.analyzeWasteImage(imageSrc);
      setAiAnalysis(data);

      // Auto-apply AI findings to form for convenience
      if (data) {
        // Map detected category
        if (data.waste_category === 'hazardous') {
          const match = CATEGORY_OPTIONS.find((c) => c.label === 'Hazardous Chemical Waste');
          if (match) setSelectedCategory(match);
        } else if (data.waste_category === 'overflowing_bin' || data.waste_category === 'dumpster_full') {
          const match = CATEGORY_OPTIONS.find((c) => c.label === 'Overflowing Bin');
          if (match) setSelectedCategory(match);
        } else if (data.waste_category === 'general_litter' || data.waste_category === 'uncollected') {
          const match = CATEGORY_OPTIONS.find((c) => c.label === 'Illegal Dumping');
          if (match) setSelectedCategory(match);
        }

        // Map severity
        if (data.severity === 'critical') setSeverity('Urgent');
        else if (data.severity === 'high' || data.severity === 'medium') setSeverity('Moderate');
        else setSeverity('Routine');

        // Append detailed technical description if empty or short
        if (!description.trim() && data.detailed_description) {
          setDescription(data.detailed_description);
        }
      }
    } catch (e) {
      console.warn('AI analysis exception:', e);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Image Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const remainingSlots = 5 - photos.length;
      const filesToRead = Array.from(e.target.files).slice(0, remainingSlots);

      filesToRead.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64Str = event.target.result as string;
            setPhotos((prev) => [...prev, base64Str].slice(0, 5));

            // Trigger AI analysis on the first uploaded photo
            if (index === 0 && !aiAnalysis) {
              runAiAnalysis(base64Str);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (photos.length <= 1) {
      setAiAnalysis(null);
    }
  };

  // Tag Click Handler
  const handleTagClick = (tag: string) => {
    if (description.includes(tag)) return;
    const separator = description.trim().length > 0 ? (description.endsWith('.') ? ' ' : '. ') : '';
    const newText = `${description}${separator}${tag}`;
    if (newText.length <= 500) {
      setDescription(newText);
    }
  };

  // Quick Action: Fill Sample Report
  const handleFillSample = () => {
    const template = SAMPLE_REPORT_TEMPLATES[Math.floor(Math.random() * SAMPLE_REPORT_TEMPLATES.length)];
    const matchingCategory = CATEGORY_OPTIONS.find((c) => c.label === template.category) || CATEGORY_OPTIONS[0];
    setSelectedCategory(matchingCategory);
    setSeverity(template.severity as UiSeverity);
    setDescription(template.description);
    setAddress(template.location.address);
    setLandmark(template.location.landmark);
    setCoords({ lat: template.location.lat, lng: template.location.lng });
    setReporterName(template.reporterName);
    setReporterContact(template.reporterPhone);
    setSpotNotes('Next to storm drainage grate behind local food stall');

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([template.location.lat, template.location.lng], 16, { animate: true });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([template.location.lat, template.location.lng]);
    }
  };

  // Quick Action: Add Sample Photo & trigger AI Vision
  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80'
    ];
    const picked = samplePhotos[photos.length % samplePhotos.length];
    if (photos.length < 5) {
      setPhotos((prev) => [...prev, picked]);
      // Trigger AI Analysis
      runAiAnalysis(picked);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!address.trim()) {
      setFormError('Please provide a detected street address.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter description or landmarks for the municipal crew.');
      return;
    }

    setIsSubmitting(true);

    const mappedSeverity: IssueSeverity =
      severity === 'Routine' ? 'Low' : severity === 'Moderate' ? 'Medium' : 'Critical';

    try {
      const result = await api.createIssue({
        category: selectedCategory.label,
        description: description.trim(),
        severity: mappedSeverity,
        location: {
          lat: coords.lat,
          lng: coords.lng,
          address: address.trim(),
          landmark: `${landmark.trim()}${spotNotes.trim() ? ` · ${spotNotes.trim()}` : ''}`
        },
        photoUrl: photos.length > 0 ? photos[0] : undefined,
        reporterName: reporterName.trim() || 'Anonymous Citizen',
        reporterPhone: reporterContact.trim() || undefined
      });

      setSubmittedIssueId(result.data.id);
      if (onReportSubmitted) {
        onReportSubmitted(result.data.id);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Could not submit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submittedIssueId) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white border border-emerald-100 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full">
            Incident Successfully Logged
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2">
            Civic Report Transmitted
          </h2>

          <p className="text-slate-600 text-sm max-w-md mx-auto mb-8">
            Thank you for helping keep our communities clean and safe. Your report has been geo-logged into the municipal triage queue and synced with MongoDB.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left">
            <div className="text-xs text-slate-500 font-semibold">Tracking Reference Ticket</div>
            <div className="text-xl font-mono-tabular font-extrabold text-slate-900 mt-1">
              {submittedIssueId}
            </div>
            <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Status: Pending Dispatch Triage
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToFeed}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Track in Incident Feed
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedIssueId(null);
                setDescription('');
                setPhotos([]);
                setSpotNotes('');
                setAiAnalysis(null);
              }}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Badge: Exact match to image */}
      <div className="mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Civic Cleanliness Dispatch
        </span>
      </div>

      {/* Header & Subtitle with Sample Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Waste Issue
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Help municipal teams detect and clear hazardous rubbish, overflowing bins, and unlawful dumping with auto-located civic dispatch.
          </p>
        </div>

        {/* Quick action sample buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap pt-1 sm:pt-0">
          <button
            type="button"
            onClick={handleFillSample}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-300 rounded-lg transition-colors cursor-pointer min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sample Report</span>
          </button>
          <button
            type="button"
            onClick={handleAddSamplePhoto}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer min-h-[38px]"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Sample Photo</span>
          </button>
        </div>
      </div>

      {/* Main Report Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-6 sm:space-y-7">
        
        {/* Error notification if validation fails */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Issue Category: Exact card dropdown as in image */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
              Issue Category <span className="text-emerald-600 font-bold">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Select what best matches the waste
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full bg-white hover:bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  {selectedCategory.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedCategory.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {selectedCategory.subtitle}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full p-3 text-left flex items-center gap-3 hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                      selectedCategory.label === cat.label ? 'bg-emerald-50/70' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">
                        {cat.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {cat.subtitle}
                      </div>
                    </div>
                    {selectedCategory.label === cat.label && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. SEVERITY LEVEL: Exact 3 horizontal option cards */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            SEVERITY LEVEL
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SEVERITY_LEVELS.map((lvl) => {
              const isSelected = severity === lvl.key;
              return (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => setSeverity(lvl.key)}
                  className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? `${lvl.borderColor} ${lvl.activeBg} ring-2 ring-emerald-500/10`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${lvl.dotColor}`}></span>
                    <span className="text-xs font-bold text-slate-900">
                      {lvl.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-4">
                    {lvl.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Visual Evidence: Exact dashed dropzone with 0/5 counter + AI Vision Integration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Visual Evidence <span className="font-normal text-slate-400">(Photos or snapshots)</span></span>
              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => runAiAnalysis(photos[0])}
                  disabled={isAnalyzingAi}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Bot className="w-3 h-3 text-emerald-600" />
                  {isAnalyzingAi ? 'Analyzing AI...' : 'Re-Run AI Vision'}
                </button>
              )}
            </label>
            <span className="text-[11px] text-slate-400 font-medium font-mono-tabular">
              {photos.length} / 5 photos attached
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Dropzone Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                const remaining = 5 - photos.length;
                Array.from(e.dataTransfer.files).slice(0, remaining).forEach((f, idx) => {
                  const r = new FileReader();
                  r.onload = (ev) => {
                    if (ev.target?.result) {
                      const base64 = ev.target.result as string;
                      setPhotos((p) => [...p, base64].slice(0, 5));
                      if (idx === 0) runAiAnalysis(base64);
                    }
                  };
                  r.readAsDataURL(f);
                });
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-emerald-300/80 hover:border-emerald-400 bg-emerald-50/20'
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-slate-800">
              Drag and drop images here, or{' '}
              <span className="text-emerald-700 font-bold underline cursor-pointer">
                browse files
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Supports JPG, PNG, WEBP up to 10MB per file · Auto-resizes for rapid municipal upload
            </div>
          </div>

          {/* Photo Previews Strip */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5 mt-3">
              {photos.map((src, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square">
                  <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(idx);
                    }}
                    className="absolute top-1 right-1 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Computer Vision & Environmental Safety Analysis Card */}
          {isAnalyzingAi && (
            <div className="mt-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 animate-in fade-in">
              <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  AI Computer Vision Analyzing Waste Image...
                </div>
                <div className="text-[11px] text-emerald-700">
                  Detecting waste classification, hazard severity level, and recommended municipal response.
                </div>
              </div>
            </div>
          )}

          {aiAnalysis && !isAnalyzingAi && (
            <div className="mt-3 p-4 rounded-2xl bg-white border border-emerald-300 shadow-xs animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    EcoClean AI Vision Diagnosis
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono-tabular">
                    {Math.round((aiAnalysis.confidence_score || 0.9) * 100)}% Confidence
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    {aiAnalysis.severity} / {aiAnalysis.urgency}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium text-[11px] block">Detected Condition:</span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {aiAnalysis.detailed_description}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium text-[11px] block">Recommended Municipal Response:</span>
                  <p className="text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80">
                    {aiAnalysis.suggested_action}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Description & Landmark Details with tags and 0/500 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
              Description & Landmark Details <span className="text-emerald-600 font-bold">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono-tabular">
              {description.length} / 500
            </span>
          </div>

          <textarea
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, landmarks, nearby street signs, or if waste is obstructing pedestrian movement..."
            className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          {/* Common Civic Tags */}
          <div className="mt-2.5">
            <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
              Click to append common civic tags:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CIVIC_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>+</span>
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Incident Location (Real-Time GPS Map) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
              Incident Location (Real-Time GPS Map) <span className="text-emerald-600 font-bold">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Google Maps Live Detection
            </span>
          </div>

          {/* GPS Header Banner */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Real-Time GPS Location
                </div>
                <div className="text-[11px] text-slate-500">
                  Detect live GPS or click anywhere on the Google Map to pinpoint waste.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="w-full sm:w-auto justify-center px-3.5 py-2.5 sm:py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs min-h-[40px]"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting Live GPS...' : 'Detect Current Location'}</span>
            </button>
          </div>

          {/* Notification when location is successfully detected */}
          {locationSuccessMsg && (
            <div className="mb-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{locationSuccessMsg}</span>
            </div>
          )}

          {/* Interactive Live Map Canvas with OpenStreetMap / Satellite Tiles */}
          <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            {/* Real-Time Leaflet Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map vs Satellite Toggle (Top Left) */}
            <div className="absolute top-3 left-3 bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex z-10">
              <button
                type="button"
                onClick={() => setMapMode('map')}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  mapMode === 'map' ? 'bg-white text-slate-900 font-bold' : 'bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer border-l border-slate-200 ${
                  mapMode === 'satellite' ? 'bg-white text-slate-900 font-bold' : 'bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Re-center / GPS Button (Top Right) */}
            <button
              type="button"
              onClick={handleDetectLocation}
              className="absolute top-3 right-3 bg-white p-2 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer z-10 transition-colors"
              title="Detect my current location"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Floating tooltip at bottom: Exact match to image */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-slate-900/90 text-white text-[11px] font-medium px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Click anywhere on the map to fine-tune location
              </div>
            </div>
          </div>

          {/* Form fields below map: Exact match to image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detected Street Address <span className="text-emerald-600 font-bold">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 Market Street, Sector 4"
                className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Area / Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Metro Gate 2, Central Market"
                className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Spot Notes (Optional)
            </label>
            <input
              type="text"
              value={spotNotes}
              onChange={(e) => setSpotNotes(e.target.value)}
              placeholder="e.g. Behind the community bus shelter, next to storm drain"
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* 6. REPORTER NOTIFICATION (OPTIONAL) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              REPORTER NOTIFICATION (OPTIONAL)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Reports can be completely anonymous
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your Name (Optional)"
                className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <input
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="Email or Phone for Resolution SMS"
                className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Checkbox: Exact match to image */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyCheck"
              checked={notifyOnComplete}
              onChange={(e) => setNotifyOnComplete(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
            />
            <label htmlFor="notifyCheck" className="text-xs text-slate-600 font-medium cursor-pointer">
              Send me notification when municipal crew completes this cleanup
            </label>
          </div>
        </div>

        {/* Card Footer: Privacy Guarantee & Submit Button */}
        <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-semibold text-slate-700">Civic Privacy Guarantee:</span> Submissions are routed directly to authorized waste services.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-3.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            {isSubmitting ? (
              <span>Submitting to Municipal Queue...</span>
            ) : (
              <>
                <span>Submit Report</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
