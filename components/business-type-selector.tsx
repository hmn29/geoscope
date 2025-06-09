"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Utensils, ShoppingBag, Laptop, Heart, Car, Scissors, Dumbbell, GraduationCap, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BusinessTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (businessType: string, category: string) => void
}

const businessTypes = [
  {
    category: "food_service",
    name: "Food & Dining",
    icon: Utensils,
    color: "from-orange-500 to-red-500",
    types: ["restaurant", "cafe", "bakery", "meal_takeaway", "food"],
    examples: ["Restaurant", "Cafe", "Bakery", "Fast Food"],
  },
  {
    category: "retail",
    name: "Retail Store",
    icon: Store,
    color: "from-blue-500 to-cyan-500",
    types: ["store", "clothing_store", "shoe_store", "book_store"],
    examples: ["Clothing Store", "Bookstore", "Shoe Store", "General Store"],
  },
  {
    category: "grocery",
    name: "Grocery & Supermarket",
    icon: ShoppingBag,
    color: "from-green-500 to-emerald-500",
    types: ["grocery_or_supermarket", "supermarket", "convenience_store"],
    examples: ["Supermarket", "Grocery Store", "Convenience Store"],
  },
  {
    category: "electronics",
    name: "Electronics & Tech",
    icon: Laptop,
    color: "from-purple-500 to-pink-500",
    types: ["electronics_store", "computer_store", "phone_store"],
    examples: ["Electronics Store", "Computer Shop", "Phone Store"],
  },
  {
    category: "health",
    name: "Health & Wellness",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    types: ["pharmacy", "hospital", "doctor", "dentist", "physiotherapist"],
    examples: ["Pharmacy", "Clinic", "Dental Office", "Wellness Center"],
  },
  {
    category: "automotive",
    name: "Automotive",
    icon: Car,
    color: "from-gray-500 to-slate-500",
    types: ["car_dealer", "car_repair", "gas_station", "car_wash"],
    examples: ["Car Dealership", "Auto Repair", "Gas Station", "Car Wash"],
  },
  {
    category: "beauty",
    name: "Beauty & Personal Care",
    icon: Scissors,
    color: "from-pink-500 to-rose-500",
    types: ["beauty_salon", "hair_care", "spa", "nail_salon"],
    examples: ["Hair Salon", "Beauty Salon", "Spa", "Nail Salon"],
  },
  {
    category: "fitness",
    name: "Fitness & Recreation",
    icon: Dumbbell,
    color: "from-yellow-500 to-orange-500",
    types: ["gym", "fitness_center", "sports_club", "yoga_studio"],
    examples: ["Gym", "Fitness Center", "Yoga Studio", "Sports Club"],
  },
  {
    category: "education",
    name: "Education & Services",
    icon: GraduationCap,
    color: "from-indigo-500 to-blue-500",
    types: ["school", "university", "library", "tutoring"],
    examples: ["School", "Training Center", "Library", "Tutoring"],
  },
]

export function BusinessTypeSelector({ isOpen, onClose, onSelect }: BusinessTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleSelect = (businessType: any) => {
    setSelectedType(businessType.category)
    onSelect(businessType.category, businessType.name)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-slate-800/95 border-blue-800/30 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">What type of business are you planning?</CardTitle>
                    <p className="text-blue-300 mt-2">
                      Select your business type to get relevant competitor analysis and insights
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-blue-300 hover:text-white hover:bg-blue-900/30"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {businessTypes.map((type, index) => (
                    <motion.div
                      key={type.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer transition-all duration-300 hover:border-blue-500/50 bg-slate-700/30 border-slate-600/50"
                        onClick={() => handleSelect(type)}
                      >
                        <CardContent className="p-6 text-center">
                          <div
                            className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                          >
                            <type.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-lg mb-2">{type.name}</h3>
                          <div className="space-y-1 mb-4">
                            {type.examples.slice(0, 3).map((example, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs border-blue-400/50 text-blue-300 mr-1"
                              >
                                {example}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white`}
                          >
                            Select This Type
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Why do we need this?</h4>
                      <p className="text-blue-200 text-sm">
                        By knowing your business type, we can show you relevant competitors in your field and provide
                        more accurate market analysis. For example, if you're opening a restaurant, we'll show you other
                        restaurants nearby, not electronics stores.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
