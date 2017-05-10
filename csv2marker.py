import csv, sys, os, subprocess, re
import operator, getopt, decimal

reload(sys)
sys.setdefaultencoding('utf8')

nheaderlines = 1

Species = [] # List of species


# Process input and output arguments
inputfile = ''
outputfile = ''
argv = sys.argv[1:]
try:
  opts, args = getopt.getopt(argv,"hi:o:",["ifile=","ofile="])
  if opts == []:
    print("csv2json.py -i <inputfile> -o <outputfile>")
    sys.exit(2)
except getopt.GetoptError:
    print("csv2json.py -i <inputfile> -o <outputfile>")
    sys.exit(2)
for opt, arg in opts:
  if opt == '-h':
    print("csv2json.py -i <inputfile> -o <outputfile>")
    sys.exit()
  elif opt in ("-i", "--ifile"):
    inputfile = arg
  elif opt in ("-o", "--ofile"):
    outputfile = arg
  else:
    print("csv2json.py -i <inputfile> -o <outputfile>")
    sys.exit()


# Read file and extract variables
file = open(inputfile, 'rt')

#Write file
wfile = open(outputfile, 'w')
nheaders = 0
id = 0
scale = 50
ln = 5

try:
  reader = csv.reader(file, delimiter=",")
  for line in reader:
    # Process headers
    if nheaders < nheaderlines:
      nheaders = nheaders + 1
      print(line)
    # 
    else:
      lat = float(line[1])
      lon = float(line[2])
      allometry = float(line[3])
      allometry_scaled = float(line[5])
      eco = float(line[4])
      eco_scaled = float(line[6])
      species = line[0]
      colour = line[7]
      id = id + 1
      case = eco
      print(species)
      if (case > 0):
        wfile.write('\n\
        \nvar %s = L.circleMarker([%.4f,%.4f], {\
        \n  radius: %.4f * scale,\
        \n  color: \'%s\',\
        \n  fillColor: \'%s\',\
        \n  fillOpacity: 0.7\
        \n  }).bindPopup("<strong><i>%s</i></strong><br/>Ecological cline: %.4f");' % (species, lat, lon, eco_scaled, colour, colour, species, eco))
      else:
        wfile.write('\n\
        \nvar %s = L.rectangle([[%.4f -ln, %.4f -ln],[%.4f + ln, %.4f + ln]], {\
        \n  weight: 1,\
        \n  color: \'%s\',\
        \n  fillColor: \'%s\',\
        \n  fillOpacity: 0.7\
        \n  }).bindPopup("<strong><i>%s</i></strong><br/>Ecological cline: %.4f");' % (species, lat, lon,lat, lon, colour, colour, species, eco))

finally:
  file.close()
  wfile.close()
