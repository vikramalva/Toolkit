# TODO: parse SEQNAME and KNOWNS in a proper way
# NGL: http://arose.github.io/ngl/api/Stage.html#event:fullscreenChanged

echo "#Executing MODELLER." >> ../results/process.log

#convert alignment file to PIR, if it is not already PIR

if grep -E '^sequence' %alignment.path
then 
    cp %alignment.path alignment.pir
else
    pir_converter.pl -i %alignment.path -o alignment.pir -fas -tmp .
fi

#extract templates and sequence
KNOWNS=`cat alignment.pir | grep 'structure' | cut -d':' -f 2 | sed "s/\(.*\)/'\1'/"  | paste -sd',' -`
SEQNAME=`cat alignment.pir | grep sequence | cut -d':' -f 2`
FILENAME=%jobid.content
# replace filename with jobID
sed -i -- "s/${SEQNAME}/${FILENAME}/g" alignment.pir
# create python file
touch modeller.py
echo "# Homology modeling by the automodel class" >> modeller.py
echo "from modeller import *               # Load standard Modeller classes" >> modeller.py
echo "from modeller.automodel import *     # Load the automodel class" >> modeller.py
echo "log.verbose()" >> modeller.py
echo "env = environ()                      # create a new MODELLER environment to build this model" >> modeller.py
echo "# directories for input atom files" >> modeller.py

# If we have a parentID, append the cif files generated by the parent
PARENTID=%parentid.content
if [ "${PARENTID}" ]; then
    echo "env.io.atom_files_directory = '$(readlink -f ../../${PARENTID}/results/cif):%CIFALL'" >> modeller.py 
else
    echo "env.io.atom_files_directory = '%CIFALL'" >> modeller.py
fi
echo "a = automodel(env," >> modeller.py
echo "             alnfile  = 'alignment.pir',    # alignment filename" >> modeller.py
echo "             knowns   = (${KNOWNS}),     #codes of the templates" >> modeller.py
echo "             sequence = '${FILENAME}') #code of the target" >> modeller.py
echo "a.starting_model= 1                       # index of the first model" >> modeller.py
echo "a.ending_model = 1                        # index of the last model" >> modeller.py
echo "a.make()                                  # do the actual homology modeling" >> modeller.py
#remove ^M
tr -d $'\r' < modeller.py >> modeller_script.py
mv modeller.py modeller_script.py
chmod 0777 modeller_script.py
chmod 0777 alignment.pir
# run modeller
mod modeller_script.py >> modeller.log
mv modeller.log ../logs/
mv ${FILENAME}* ../results/

echo "done" >> ../results/process.log

echo "#Running quality checks on the model." >> ../results/process.log

echo "done" >> ../results/process.log

#quality check
cd ../results
mv `echo *[0-9].pdb` ${FILENAME}.pdb

echo "#Running ANOLEA." >> ../results/process.log

#ANOLEA
mkdir anolea
cd anolea
anolea ${BIOPROGS}/helpers/anolea_bin/surf.de ${BIOPROGS}/helpers/anolea_bin/pair.de ../${FILENAME}.pdb
perl ${BIOPROGS}/helpers/anolea_bin/anolea_graphics.pl ${FILENAME} ../ > ${FILENAME}.log_anolea
cd ../
mv *.gnuplot* anolea/
mv *.anolea* anolea/
mv anolea/${FILENAME}.anolea.png .


echo "done" >> ../results/process.log

echo "#Running Solvx." >> ../results/process.log

#Solvx
mkdir solvx
cd solvx
ln -sf solvx solvx
ln -sf ${BIOPROGS}/helpers/Solvx/torso.reslib torso.reslib
echo "../${FILENAME}.pdb" | solvx
mv fort.29 ${FILENAME}.solvx
perl ${BIOPROGS}/helpers/Solvx/solvx_graphics.pl "${FILENAME}" . > ${FILENAME}.log_solvx
mv ${FILENAME}.solvx.png ../
cd ../
echo "done" >> ../results/process.log
