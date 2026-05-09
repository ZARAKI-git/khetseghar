'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { createClient } from '@/lib/supabase/client'
import type { Language, Category } from '@/lib/types'
import { t } from '@/lib/translations'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'

export default function NewListingPage() {
  const [lang, setLang] = useState<Language>('en')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [unit, setUnit] = useState('kg')
  const [quantityAvailable, setQuantityAvailable] = useState('')
  const [minOrderQuantity, setMinOrderQuantity] = useState('1')
  const [isOrganic, setIsOrganic] = useState(false)
  const [location, setLocation] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem('khetseghar-lang') as Language
    if (savedLang && ['en', 'hi', 'pa'].includes(savedLang)) {
      setLang(savedLang)
    }

    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name_en')
      if (data) setCategories(data)
    }
    fetchCategories()

    // Check auth
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
    checkAuth()
  }, [supabase, router])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    for (const file of Array.from(files)) {
      // For demo, we'll use a placeholder URL
      // In production, you'd upload to Supabase Storage or Vercel Blob
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        if (newImages.length === files.length) {
          setImages([...images, ...newImages])
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to create a listing')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('listings').insert({
      farmer_id: user.id,
      category_id: categoryId,
      title,
      description,
      price_per_unit: parseFloat(pricePerUnit),
      unit,
      quantity_available: parseFloat(quantityAvailable),
      min_order_quantity: parseFloat(minOrderQuantity) || 1,
      images,
      is_organic: isOrganic,
      location,
      harvest_date: harvestDate || null,
      is_active: true,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/farmer')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/farmer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('addListing', lang)}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">{t('title', lang)} *</FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Fresh Organic Tomatoes"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">{t('categories', lang)} *</FieldLabel>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">{t('description', lang)}</FieldLabel>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product..."
                    rows={4}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="price">{t('pricePerUnit', lang)} (₹) *</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      placeholder="50"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="unit">{t('unit', lang)} *</FieldLabel>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="quintal">Quintal</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                        <SelectItem value="dozen">Dozen</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="litre">Litre</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="quantity">{t('quantity', lang)} *</FieldLabel>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quantityAvailable}
                      onChange={(e) => setQuantityAvailable(e.target.value)}
                      placeholder="100"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="minOrder">Min. Order Quantity</FieldLabel>
                    <Input
                      id="minOrder"
                      type="number"
                      min="0"
                      step="0.01"
                      value={minOrderQuantity}
                      onChange={(e) => setMinOrderQuantity(e.target.value)}
                      placeholder="1"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="location">{t('location', lang)}</FieldLabel>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Village, District, State"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="harvestDate">{t('harvestDate', lang)}</FieldLabel>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                  />
                </Field>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium text-foreground">{t('organic', lang)}</p>
                    <p className="text-sm text-muted-foreground">Is this product organically grown?</p>
                  </div>
                  <Switch checked={isOrganic} onCheckedChange={setIsOrganic} />
                </div>

                {/* Image Upload */}
                <Field>
                  <FieldLabel>Product Images</FieldLabel>
                  <div className="space-y-4">
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {images.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload images</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </Field>
              </FieldGroup>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                  {t('cancel', lang)}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    t('save', lang)
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
