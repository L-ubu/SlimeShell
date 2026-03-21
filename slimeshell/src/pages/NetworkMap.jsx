import { useState, useRef, useCallback } from 'react'
import { Plus, Trash2, Move, Server, Monitor, Wifi, Globe, Shield, Database } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const nodeTypes = [
  { type: 'server', label: 'Server', icon: Server, color: '#6EE7B7' },
  { type: 'workstation', label: 'Workstation', icon: Monitor, color: '#7DD3FC' },
  { type: 'router', label: 'Router', icon: Wifi, color: '#FBBF24' },
  { type: 'firewall', label: 'Firewall', icon: Shield, color: '#FB7185' },
  { type: 'internet', label: 'Internet', icon: Globe, color: '#A78BFA' },
  { type: 'database', label: 'Database', icon: Database, color: '#F472B6' },
]

const initialNodes = [
  { id: 1, type: 'internet', label: 'Internet', ip: '0.0.0.0', x: 400, y: 60, status: 'up' },
  { id: 2, type: 'firewall', label: 'Edge Firewall', ip: '10.0.0.1', x: 400, y: 160, status: 'up' },
  { id: 3, type: 'router', label: 'Core Router', ip: '10.0.0.2', x: 400, y: 260, status: 'up' },
  { id: 4, type: 'server', label: 'Web Server', ip: '10.0.1.10', x: 200, y: 370, status: 'up' },
  { id: 5, type: 'server', label: 'App Server', ip: '10.0.1.11', x: 400, y: 370, status: 'up' },
  { id: 6, type: 'database', label: 'DB Server', ip: '10.0.2.10', x: 600, y: 370, status: 'up' },
  { id: 7, type: 'workstation', label: 'Admin PC', ip: '10.0.3.5', x: 150, y: 480, status: 'up' },
  { id: 8, type: 'workstation', label: 'Dev Machine', ip: '10.0.3.6', x: 350, y: 480, status: 'compromised' },
]

const initialConnections = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 3, to: 5 },
  { from: 3, to: 6 },
  { from: 3, to: 7 },
  { from: 3, to: 8 },
  { from: 5, to: 6 },
]

const statusColors = { up: '#6EE7B7', down: '#FB7185', compromised: '#FBBF24' }

export default function NetworkMap() {
  const [nodes, setNodes] = useState(initialNodes)
  const [connections] = useState(initialConnections)
  const [selectedNode, setSelectedNode] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [addType, setAddType] = useState('server')
  const canvasRef = useRef(null)

  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation()
    setSelectedNode(nodeId)
    setDragging(nodeId)
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setNodes((prev) => prev.map((n) => n.id === dragging ? { ...n, x, y } : n))
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  const addNode = () => {
    const newNode = {
      id: Date.now(),
      type: addType,
      label: `New ${nodeTypes.find((t) => t.type === addType)?.label}`,
      ip: '10.0.0.x',
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      status: 'up',
    }
    setNodes([...nodes, newNode])
    setSelectedNode(newNode.id)
  }

  const removeNode = (id) => {
    setNodes(nodes.filter((n) => n.id !== id))
    if (selectedNode === id) setSelectedNode(null)
  }

  const selectedNodeData = nodes.find((n) => n.id === selectedNode)
  const nodeTypeLookup = Object.fromEntries(nodeTypes.map((t) => [t.type, t]))

  return (
    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[calc(100vh-120px)]">
      {/* Canvas */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Network Topology</span>
          <div className="flex items-center gap-3">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-mono text-[11px] text-text-faint capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          ref={canvasRef}
          className="flex-1 bg-slime-code rounded-md border border-white/[0.04] relative overflow-hidden cursor-crosshair min-h-[400px]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedNode(null)}
        >
          {/* Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connections */}
            {connections.map((conn, i) => {
              const fromNode = nodes.find((n) => n.id === conn.from)
              const toNode = nodes.find((n) => n.id === conn.to)
              if (!fromNode || !toNode) return null
              return (
                <line
                  key={i}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="rgba(110,231,183,0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const nt = nodeTypeLookup[node.type]
            const Icon = nt?.icon || Server
            const isSelected = selectedNode === node.id
            return (
              <div
                key={node.id}
                className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing select-none
                  ${isSelected ? 'z-10' : 'z-0'}`}
                style={{ left: node.x - 30, top: node.y - 30 }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id) }}
              >
                <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center transition-all
                  ${isSelected ? 'ring-2 ring-mint scale-110' : 'hover:scale-105'}
                  bg-slime-card border border-white/[0.08]`}
                >
                  <Icon size={22} style={{ color: nt?.color || '#6EE7B7' }} />
                </div>
                <div className="mt-1 text-center">
                  <div className="font-mono text-[11px] text-text-secondary whitespace-nowrap">{node.label}</div>
                  <div className="font-mono text-[10px] text-text-faint">{node.ip}</div>
                </div>
                <div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slime-code"
                  style={{ backgroundColor: statusColors[node.status] }}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Controls */}
      <div className="w-full md:w-[260px] flex-shrink-0 flex flex-col gap-3">
        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-3">Add Node</span>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {nodeTypes.map((nt) => {
              const Icon = nt.icon
              return (
                <button
                  key={nt.type}
                  onClick={() => setAddType(nt.type)}
                  aria-label={`Select ${nt.label} node type`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md cursor-pointer transition-all
                    focus-visible:ring-2 focus-visible:ring-mint focus:outline-none
                    ${addType === nt.type ? 'bg-mint/10 border border-mint/20' : 'bg-slime-code hover:bg-white/[0.04]'}`}
                >
                  <Icon size={16} style={{ color: nt.color }} />
                  <span className="font-mono text-[10px] text-text-dim">{nt.label}</span>
                </button>
              )
            })}
          </div>
          <Button variant="ghost" size="small" onClick={addNode} className="w-full">
            <Plus size={12} /> Add {nodeTypes.find((t) => t.type === addType)?.label}
          </Button>
        </Card>

        {selectedNodeData && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-semibold uppercase text-text-dim">Node Details</span>
              <button
                onClick={() => removeNode(selectedNodeData.id)}
                aria-label="Remove selected node"
                className="text-text-faint hover:text-rose cursor-pointer
                  focus-visible:ring-2 focus-visible:ring-mint focus:outline-none rounded"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <span className="font-mono text-[11px] text-text-faint">Label</span>
                <div className="font-mono text-[12px] text-text-primary">{selectedNodeData.label}</div>
              </div>
              <div>
                <span className="font-mono text-[11px] text-text-faint">Type</span>
                <div className="flex items-center gap-1.5">
                  <Badge color={selectedNodeData.type === 'firewall' ? 'rose' : 'mint'}>
                    {selectedNodeData.type}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-mono text-[11px] text-text-faint">IP Address</span>
                <div className="font-mono text-[12px] text-mint">{selectedNodeData.ip}</div>
              </div>
              <div>
                <span className="font-mono text-[11px] text-text-faint">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[selectedNodeData.status] }} />
                  <span className="font-mono text-[11px] text-text-primary capitalize">{selectedNodeData.status}</span>
                </div>
              </div>
              <div>
                <span className="font-mono text-[11px] text-text-faint">Position</span>
                <div className="font-mono text-[11px] text-text-dim">
                  x: {Math.round(selectedNodeData.x)}, y: {Math.round(selectedNodeData.y)}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <span className="font-mono text-[11px] font-semibold uppercase text-text-dim block mb-2">Network Summary</span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="font-mono text-[11px] text-text-dim">Nodes</span>
              <span className="font-mono text-[11px] text-text-primary">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[11px] text-text-dim">Connections</span>
              <span className="font-mono text-[11px] text-text-primary">{connections.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[11px] text-text-dim">Compromised</span>
              <span className="font-mono text-[11px] text-gold">{nodes.filter((n) => n.status === 'compromised').length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
