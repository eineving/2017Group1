package model;

public class PhysicalPrint implements DataModel {
    private int id;
    private int digitalPrintID;
    private String slmPath;

    public int getId() {
        return id;
    }

    public int getDigitalPrintID() {
        return digitalPrintID;
    }

    public String getSlmPath() {
        return slmPath;
    }

}
