"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Heart,
  MapPin,
  Calendar,
  Grid,
  List,
  ChevronDown,
  X,
  Shuffle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Type definitions
interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

interface SearchFilters {
  breeds: string[];
  zipCodes: string[];
  ageMin?: number;
  ageMax?: number;
  sort: string;
  size: number;
}

interface SearchResult {
  resultIds: string[];
  total: number;
  next?: string;
  prev?: string;
}

interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

export default function DogsListingPage() {
  const router = useRouter();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // State management
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [selectedDogs, setSelectedDogs] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    breeds: [],
    zipCodes: [],
    ageMin: undefined,
    ageMax: undefined,
    sort: "breed:asc",
    size: 25,
  });

  // UI state
  const [breedOptions] = useState([
    "Labrador Retriever",
    "Golden Retriever",
    "German Shepherd",
    "Bulldog",
    "Poodle",
    "Beagle",
    "Rottweiler",
    "Yorkshire Terrier",
    "Dachshund",
    "Siberian Husky",
  ]);

  // ✅ PROPER AUTH CHECK - Works with HTTPOnly cookies
  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      console.log("🔍 Checking authentication status...");

      // Method 1: Try the dogs search API (this requires auth)
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/dogs/search?size=1",
        {
          method: "GET",
          credentials: "include", // Sends HTTPOnly cookies
        }
      );

      if (response.ok) {
        console.log("✅ User is authenticated");
        setIsAuthenticated(true);
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log("❌ User is not authenticated");
        setIsAuthenticated(false);
        return false;
      } else {
        console.log("⚠️ Ambiguous auth response, assuming not authenticated");
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("🚨 Auth check failed:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // ✅ AUTH CHECK ON MOUNT
  useEffect(() => {
    const initializeAuth = async () => {
      const authenticated = await checkAuthentication();

      if (!authenticated) {
        console.log("🔄 Redirecting to auth page...");
        const currentPath = window.location.pathname + window.location.search;
        router.replace(`/auth?returnUrl=${encodeURIComponent(currentPath)}`);
        return; // Don't continue with data loading
      }

      // If authenticated, load the dogs data
      console.log("✅ User authenticated, loading dogs...");
      fetchDogs();
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once on mount

  // Fetch dogs function
  const fetchDogs = useCallback(
    async (searchFilters?: SearchFilters, from?: string) => {
      // Don't fetch if not authenticated
      if (isAuthenticated === false) {
        console.log("❌ Not authenticated, skipping dogs fetch");
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        const currentFilters = searchFilters || filters;

        if (currentFilters.breeds.length > 0) {
          currentFilters.breeds.forEach((breed) =>
            params.append("breeds", breed)
          );
        }
        if (currentFilters.zipCodes.length > 0) {
          currentFilters.zipCodes.forEach((zip) =>
            params.append("zipCodes", zip)
          );
        }
        if (currentFilters.ageMin)
          params.append("ageMin", currentFilters.ageMin.toString());
        if (currentFilters.ageMax)
          params.append("ageMax", currentFilters.ageMax.toString());
        if (currentFilters.sort) params.append("sort", currentFilters.sort);
        if (from) params.append("from", from);

        params.append("size", currentFilters.size.toString());

        const searchResponse = await fetch(
          `https://frontend-take-home-service.fetch.com/dogs/search?${params}`,
          { credentials: "include" }
        );

        // Handle auth expiration during API calls
        if (searchResponse.status === 401 || searchResponse.status === 403) {
          console.log("🚨 Auth expired during API call, redirecting...");
          setIsAuthenticated(false);
          router.replace("/auth");
          return;
        }

        if (!searchResponse.ok) throw new Error("Search failed");

        const searchData: SearchResult = await searchResponse.json();
        setSearchResults(searchData);

        if (searchData.resultIds.length > 0) {
          const dogsResponse = await fetch(
            "https://frontend-take-home-service.fetch.com/dogs",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(searchData.resultIds),
            }
          );

          if (!dogsResponse.ok) throw new Error("Failed to fetch dog details");

          const dogsData: Dog[] = await dogsResponse.json();
          setDogs(dogsData);
        } else {
          setDogs([]);
        }
      } catch (error) {
        console.error("Error fetching dogs:", error);
        setDogs([]);
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    },
    [filters, isAuthenticated, router] // Added dependencies
  );

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchDogs(updatedFilters);
  };

  // Handle breed filter
  const toggleBreed = (breed: string) => {
    const newBreeds = filters.breeds.includes(breed)
      ? filters.breeds.filter((b) => b !== breed)
      : [...filters.breeds, breed];
    handleFilterChange({ breeds: newBreeds });
  };

  // Handle zip code input
  const handleZipCodeAdd = (zipCode: string) => {
    if (zipCode && !filters.zipCodes.includes(zipCode)) {
      handleFilterChange({ zipCodes: [...filters.zipCodes, zipCode] });
    }
  };

  // Remove zip code
  const removeZipCode = (zipCode: string) => {
    handleFilterChange({
      zipCodes: filters.zipCodes.filter((z) => z !== zipCode),
    });
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      breeds: [],
      zipCodes: [],
      ageMin: undefined,
      ageMax: undefined,
      sort: "breed:asc",
      size: 25,
    };
    setFilters(clearedFilters);
    fetchDogs(clearedFilters);
  };

  // Handle dog selection for matching
  const toggleDogSelection = (dogId: string) => {
    const newSelection = new Set(selectedDogs);
    if (newSelection.has(dogId)) {
      newSelection.delete(dogId);
    } else {
      newSelection.add(dogId);
    }
    setSelectedDogs(newSelection);
  };

  // Find match
  const findMatch = async () => {
    if (selectedDogs.size === 0) return;

    setMatchLoading(true);
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(Array.from(selectedDogs)),
        }
      );

      // Handle auth expiration
      if (response.status === 401 || response.status === 403) {
        console.log("🚨 Auth expired during match, redirecting...");
        setIsAuthenticated(false);
        router.replace("/auth");
        return;
      }

      if (!response.ok) throw new Error("Match failed");

      const matchData = await response.json();
      const matchedDog = dogs.find((dog) => dog.id === matchData.match);

      if (matchedDog) {
        alert(
          `🎉 You've been matched with ${matchedDog.name}! Contact the shelter to proceed with adoption.`
        );
      }
    } catch (error) {
      console.error("Error finding match:", error);
      alert("Failed to find match. Please try again.");
    } finally {
      setMatchLoading(false);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (searchResults?.next) {
      const params = new URLSearchParams(searchResults.next.split("?")[1]);
      const from = params.get("from");
      if (from) fetchDogs(filters, from);
    }
  };

  const handlePrevPage = () => {
    if (searchResults?.prev) {
      const params = new URLSearchParams(searchResults.prev.split("?")[1]);
      const from = params.get("from");
      fetchDogs(filters, from || undefined);
    }
  };

  // ✅ LOADING STATE - Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ AUTH FAILED STATE - This shouldn't render since we redirect, but good fallback
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // ✅ AUTHENTICATED - Show the full dogs listing page
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Perfect Companion
          </h1>
          <p className="text-gray-600">
            Discover amazing dogs waiting for their forever homes
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Quick Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by breed, name, or zip code..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value.match(/^\d{5}$/)) {
                        handleZipCodeAdd(value);
                      } else if (
                        breedOptions.some((breed) =>
                          breed.toLowerCase().includes(value.toLowerCase())
                        )
                      ) {
                        const matchedBreed = breedOptions.find((breed) =>
                          breed.toLowerCase().includes(value.toLowerCase())
                        );
                        if (matchedBreed) toggleBreed(matchedBreed);
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Breeds Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breeds
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {breedOptions.map((breed) => (
                      <label key={breed} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.breeds.includes(breed)}
                          onChange={() => toggleBreed(breed)}
                          className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {breed}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.ageMin || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ageMin: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.ageMax || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ageMax: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      handleFilterChange({ sort: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="breed:asc">Breed (A-Z)</option>
                    <option value="breed:desc">Breed (Z-A)</option>
                    <option value="name:asc">Name (A-Z)</option>
                    <option value="name:desc">Name (Z-A)</option>
                    <option value="age:asc">Age (Young to Old)</option>
                    <option value="age:desc">Age (Old to Young)</option>
                  </select>
                </div>

                {/* Results per page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Results per page
                  </label>
                  <select
                    value={filters.size}
                    onChange={(e) =>
                      handleFilterChange({ size: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Zip Codes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Codes
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.zipCodes.map((zip) => (
                    <span
                      key={zip}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {zip}
                      <button
                        onClick={() => removeZipCode(zip)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add zip code (5 digits)"
                  maxLength={5}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const value = (e.target as HTMLInputElement).value;
                      if (value.match(/^\d{5}$/)) {
                        handleZipCodeAdd(value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {loading
              ? "Loading..."
              : `Showing ${dogs.length} of ${searchResults?.total || 0} dogs`}
          </div>

          {/* Match Section */}
          {selectedDogs.size > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedDogs.size} dog{selectedDogs.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <button
                onClick={findMatch}
                disabled={matchLoading}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                <Shuffle className="h-4 w-4" />
                {matchLoading ? "Finding Match..." : "Find My Match"}
              </button>
            </div>
          )}
        </div>

        {/* Dogs Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="h-64 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No dogs found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search filters
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Dog Image */}
                <div
                  className={`relative ${
                    viewMode === "list" ? "w-48 flex-shrink-0" : "h-64"
                  }`}
                >
                  <img
                    src={dog.img}
                    alt={dog.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleDogSelection(dog.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                      selectedDogs.has(dog.id)
                        ? "bg-pink-600 text-white"
                        : "bg-white/80 text-gray-600 hover:bg-pink-100"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        selectedDogs.has(dog.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dog Info */}
                <div className="p-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {dog.name}
                  </h3>
                  <p className="text-purple-600 font-medium mb-2">
                    {dog.breed}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {dog.age} year{dog.age !== 1 ? "s" : ""} old
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {dog.zip_code}
                    </div>
                  </div>

                  {viewMode === "list" && (
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        View Details
                      </button>
                      <button
                        onClick={() => toggleDogSelection(dog.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedDogs.has(dog.id)
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-pink-100"
                        }`}
                      >
                        {selectedDogs.has(dog.id) ? "Selected" : "Select"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {searchResults && (searchResults.next || searchResults.prev) && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={!searchResults.prev}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Showing {dogs.length} of {searchResults.total} results
            </span>
            <button
              onClick={handleNextPage}
              disabled={!searchResults.next}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
