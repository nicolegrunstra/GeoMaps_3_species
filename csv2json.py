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
scale = 1
ln = 5

wfile.write('var geojson = {\
  \n"type" : "FeatureCollection",\
  \n"features" : [')

try:
  reader = csv.reader(file, delimiter=",")
  for line in reader:
    # Process headers
    if nheaders < nheaderlines:
      nheaders = nheaders + 1
      print(line)
    # 
    else:
      lat = float(line[3])
      lon = float(line[2])

      sex = float(line[4])
      scale = float(line[5])
      species = line[1]
      specimen = line[0]
      colour = line[6]
      id = id + 1
      wfile.write('\n{\
      \n\"type\" : \"Feature\",\
      \n\"geometry\" : {\"type\" : \"Point\", \"coordinates\" : [ %.4f, %.4f ]},\
      \n\"properties\" : {\
      \n  "species" : "%s",\
      \n  "specimen" : %s,\
      \n  "sex" : %d,\
      \n  "scale" : %d,\
      \n  "colour" : \"%s\"\
      \n}\
      \n},' % (lat, lon, species, specimen, sex, scale, colour))
      
finally:
  wfile.write('\n]\n};')

  file.close()
  wfile.close()
