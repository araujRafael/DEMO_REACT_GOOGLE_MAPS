import { useState } from "react"
import { isPointInPolygon, isPointWithinRadius } from 'geolib'
import { GoogleMap, DrawingManagerF, MarkerF, useJsApiLoader, PolygonF, CircleF } from "@react-google-maps/api"
import "./App.css"
import { GeolibInputCoordinates } from "geolib/es/types"


// Interface 
interface Coords {
  lat: number
  lng: number
}
interface Perimeter {
  type: "poly" | "circle" | string
  poly?: Coords[]
  circle?: any[]
}

// waterloo, vancouver: 43.48346404142612, -80.53126987587257
// Museum: 43.47182241513661, -80.54217947296004
function App() {
  const mapsKey = process.env.REACT_APP_GOOGLE_MAPS_KEY!
  const centerMap = { lat: 43.47182241513661, lng: -80.54217947296004 }
  // Config ***************************************************************
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsKey,
    libraries: ["drawing", "geometry"],
  })
  // State ***************************************************************
  const [markers, setMarkers] = useState<Coords[]>([])
  const [perimeter, setPerimeter] =
    useState<Perimeter | null>({ poly: [], circle: [], type: "" })


  // Fn ***************************************************************
  // handles
  const handleSetMarker = (coords: Coords) => {
    setMarkers(st => [...st, coords])
  }
  const handleRemoveMarker = (coords: Coords) => {
    setMarkers(st => st.filter(c =>
      JSON.stringify(c) !== JSON.stringify(coords)))
  }
  // Verifications
  const isInsidePerimeter = (coords: Coords) => {
    const havePerimeter = perimeter?.type
    if (havePerimeter) {
      const dataPerimeter = perimeter!.poly as GeolibInputCoordinates[]
      if (havePerimeter === "circle") {
        const circleRad = perimeter!.circle as [Coords, number]
        return isPointWithinRadius(coords, ...circleRad)
      }
      return isPointInPolygon(coords, dataPerimeter)
    }
    return true
  }

  // Render ***************************************************************
  return (
    <div className="App"
      style={{
        width: "100%", height: "100vh"
      }}
    >
      {/*  */}
      <div className="map-container">

        {isLoaded && <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%"
          }}
          zoom={14}
          center={centerMap}
          onClick={e => {
            const { lat, lng } = e.latLng?.toJSON() as Coords
            const coords = { lat, lng }
            handleSetMarker(coords)
          }}
        >
          <DrawingManagerF
            onOverlayComplete={e => {
              e.overlay?.setVisible(false)
            }}
            onMarkerComplete={e => {
              const { lat, lng } = e.getPosition()?.toJSON() as Coords
              const coords = { lat, lng }
              handleSetMarker(coords)
            }}
            onRectangleComplete={e => {
              alert("no use rectangle")
            }}
            onPolygonComplete={e => {
              const path: Coords[] = e.getPath().getArray().map(c => {
                return c.toJSON()
              })
              setPerimeter({
                type: "poly",
                poly: path
              });
            }}
            onPolylineComplete={e => {
              const path: Coords[] = e.getPath().getArray().map(c => {
                return c.toJSON()
              })
              setPerimeter({
                type: "poly",
                poly: path
              });
            }}
            onCircleComplete={e => {
              const center = e.getCenter()?.toJSON()
              const rad = e.getRadius()
              const circle = [center, rad]
              setPerimeter({
                type: "circle",
                circle
              });
            }}
          />
          {perimeter?.poly?.[0] && <PolygonF
            path={perimeter.poly}
            onClick={e => {
              const { lat, lng } = e.latLng?.toJSON() as Coords
              const coords = { lat, lng }
              handleSetMarker(coords)
            }}
          />}
          {perimeter?.circle?.[0] && <CircleF
            center={perimeter?.circle?.[0]}
            radius={perimeter?.circle?.[1]}
          />}
          {/* Center Point: Museum */}
          <MarkerF
            position={centerMap}
            label={{
              className: `museum-icon`,
              text: "museum",
              color: "#fff", fontSize: ".65rem", fontWeight: "200"
            }}
          />
          {/*Your markers */}
          {
            markers?.map((coords, i) => {
              // logic
              let isInside = isInsidePerimeter(coords)
              // render
              return <MarkerF
                key={i.toString()}
                visible={isInside}
                position={coords}
                onClick={e => {
                  const { lat, lng } = e.latLng?.toJSON() as Coords
                  const coords = { lat, lng }
                  handleRemoveMarker(coords)
                }}
              />
            })
          }
        </GoogleMap>}
        {/* End map container */}
      </div>
      {/* Right sidebar */}
      <div className="r-sidebar">
        <header>
          <img src="https://github.com/araujrafael.png" alt="avatar" />
          <div className="content">
            <h1>Hi, I'm Rafael Araujo</h1>
            <p>I will show to you a simple demo of Google maps with React</p>
          </div>
        </header>
        {/* manual  */}
        <h1 className="doc">
          <header>
            How to use
          </header>
          <p>
            Left click anywhere on the map to set a marker,
            to remove click on the bookmark again.
            Use shapes to draw a perimeter and show the markers within it
          </p>
        </h1>
        {/*  */}
        <main>
          <button
            onClick={() => setPerimeter({ type: "", circle: [], poly: [] })}
          >
            Clear Perimeter
          </button>
          <button
            onClick={() => setMarkers([])}
          >
            Clear Markers
          </button>
        </main>
      </div>
    </div>
  );
}

export default App;
