import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Camera, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchDeviceMeasurementPointsList } from '@/features/dashboard/api/measurement-points'

interface MeasurementPointsTableProps {
  headquarterId: number
  panelId: number
}

export function MeasurementPointsTable({
  headquarterId,
  panelId,
}: MeasurementPointsTableProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['device-measurement-points-list', headquarterId, panelId],
    queryFn: () => fetchDeviceMeasurementPointsList(headquarterId, panelId),
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Puntos de Medición</CardTitle>
          <CardDescription>Dispositivos y puntos de monitoreo del panel</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const results = data?.results ?? []

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Puntos de Medición</CardTitle>
          <CardDescription>Dispositivos y puntos de monitoreo del panel</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center text-text-muted">
          <div className="text-center space-y-2">
            <Camera className="w-12 h-12 mx-auto text-text-muted/40" />
            <p>No se encontraron puntos de medición para este panel y rango de fechas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Puntos de Medición</CardTitle>
        <CardDescription>
          {results.length} dispositivo{results.length !== 1 ? 's' : ''} en este panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Punto de monitoreo</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Llave</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Tipo de red</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Capacidad</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Hardware</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Ubicación</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">Foto</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium text-text-primary">{item.name}</td>
                  <td className="py-3 px-2 text-text-secondary">{item.key}</td>
                  <td className="py-3 px-2 text-text-secondary capitalize">{item.type}</td>
                  <td className="py-3 px-2 text-text-secondary">{item.capacity}</td>
                  <td className="py-3 px-2 text-text-secondary">{item.hardware}</td>
                  <td className="py-3 px-2 text-text-secondary">{item.electrical_panel}</td>
                  <td className="py-3 px-2">
                    {item.location_reference ? (
                      <button
                        onClick={() => setSelectedImage(item.location_reference)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={item.location_reference}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-border"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </button>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Vista ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
