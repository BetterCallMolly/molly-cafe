package watchdogs

import (
	"log"
	"os"
	"time"

	"github.com/bettercallmolly/illustrious/socket"
)

func MonitorOpenFiles(openFilePacket *socket.Packet) {
	file, err := os.OpenFile("/proc/sys/fs/file-nr", os.O_RDONLY, 0)
	if err != nil {
		log.Fatal("/!\\ Could not open /proc/sys/fs/file-nr", err)
	}
	defer file.Close()
	for {
		file.Seek(0, 0)
		var openedFiles uint32
		buf := make([]byte, 19) // length of uint64 max's string representation
		_, err = file.Read(buf)
		if err != nil {
			log.Fatal("/!\\ Could not read /proc/sys/fs/file-nr", err)
		}
		// god tier optimisation right here
		for i := 0; i < 19; i++ {
			if buf[i] != 0x09 {
				openedFiles = openedFiles*10 + uint32(buf[i]-0x30)
			} else {
				break
			}
		}
		openFilePacket.SetUint32(openedFiles)
		time.Sleep(REFRESH_DELAY)
	}
}
